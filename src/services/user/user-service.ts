import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

import { IUserService } from "@services/user/IUserService";
import tokenService from "@services/token/token-service";
import mailService from "@services/mail-service";

import ApiError from "@exceptions/api-error";

import UserModel from "@models/User";

import UserDto from "@dtos/user-dto";

import {
  encryptAndFormatAsUuid,
  decryptFormattedUuid,
} from "@utils/cryptEmail";

import {
  IUserDocument,
  UserApiRequestType,
  UserApiResponseType,
} from "@/types/IUser";

/**
 * Class responsible for user service
 */
class UserService implements IUserService {
  /**
   * Hash cost factor
   */
  private readonly hashCostFactor = 3;

  /**
   * Generates tokens for the user
   * @param user - User document
   * @returns Tokens
   */
  private async generateTokens(
    user: IUserDocument,
  ): Promise<UserApiResponseType> {
    const userDto = new UserDto(user);

    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  /**
   * Registers user
   * @param options - User data
   * @returns Tokens
   */
  public async registration(
    options: UserApiRequestType,
  ): Promise<UserApiResponseType> {
    const existingUser = await UserModel.findOne({ email: options.email });

    if (existingUser) {
      throw ApiError.BadRequest(
        `Пользователь с данным email уже зарегистрирован`,
      );
    }

    const hashPassword = await bcrypt.hash(
      options.password,
      this.hashCostFactor,
    );
    const activationLink = uuidv4();

    const user = await UserModel.create({
      email: options.email,
      password: hashPassword,
      username: options.username,
      activationLink,
      lastPasswords: [hashPassword],
    });

    await mailService.sendActivationMail(
      options.email,
      `${process.env.API_URL}/activate/${activationLink}`,
    );

    return this.generateTokens(user);
  }

  /**
   * Logs in user
   * @param email - User email
   * @param password - User password
   * @returns Tokens
   */
  public async login(
    email: string,
    password: string,
  ): Promise<UserApiResponseType> {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest("Пользователь с таким email не был найден");
    }

    const isPassEqual = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
      throw ApiError.BadRequest("Проверьте корректность введённых данных");
    }

    if (!user.isActivated) {
      throw ApiError.BadRequest("Аккаунт не активирован");
    }

    return this.generateTokens(user);
  }

  /**
   * Logs out user
   * @param refreshToken - Refresh token
   * @returns String
   */
  public async logout(refreshToken: string): Promise<string> {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  /**
   * Activates user
   * @param activationLink - Activation link
   * @returns void
   */
  public async activate(activationLink: string): Promise<void> {
    const user = await UserModel.findOne({ activationLink });

    if (!user) {
      throw new ApiError(400, "Неккоректная ссылка активации");
    }

    user.isActivated = true;
    await user.save();
  }

  /**
   * Refreshes user
   * @param refreshToken - Refresh token
   * @returns Tokens
   */
  public async refresh(refreshToken?: string): Promise<UserApiResponseType> {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError("У вас нету refresh токена");
    }

    const userData = tokenService.validateRefreshToken(refreshToken);

    if (!userData) {
      throw ApiError.UnauthorizedError("Токен не был валидирован корректно");
    }

    const tokenFromDB = await tokenService.findToken(refreshToken);

    if (!tokenFromDB) {
      throw ApiError.UnauthorizedError("Токен не существует в базе данных");
    }

    const user = await UserModel.findById(userData.id);

    if (!user) {
      throw ApiError.UnauthorizedError("Пользователь не существует");
    }

    return this.generateTokens(user);
  }

  /**
   * Changes user password
   * @param password - New password
   * @param urlString - URL string with user email
   * @returns void
   */
  public async changePassword(password: string, urlString: string) {
    const email = decryptFormattedUuid(urlString);
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw ApiError.BadRequest("Пользователь с таким email не был найден");
    }

    const hashPassword = await bcrypt.hash(password, this.hashCostFactor);

    await UserModel.updateOne(
      { email },
      {
        password: hashPassword,
        lastPasswords: [...user.lastPasswords, hashPassword],
      },
    );
  }

  /**
   * Gets the user by the refresh token
   * @param refreshToken - Refresh token
   * @returns User
   */
  public async getUser(refreshToken: string) {
    if (!refreshToken) {
      return { user: {} };
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await tokenService.findToken(refreshToken);
    if (!userData) {
      throw ApiError.UnauthorizedError("Токен не был валидирован корретно");
    }

    if (!tokenFromDB) {
      throw ApiError.UnauthorizedError("Токен не существует в базе данных");
    }

    const user = await UserModel.findById(userData.id);

    if (!user) {
      throw ApiError.UnauthorizedError("Пользователь не существует");
    }

    const userDto = new UserDto(user);

    return { user: userDto };
  }

  /**
   * Sends change password link to the user
   * @param email - User email
   * @returns void
   */
  public async sendChangePasswordLink(email: string) {
    const generatedLink = encryptAndFormatAsUuid(email);
    const changePasswordLink = `${process.env.CLIENT_URL}/changePassword/${generatedLink}`;
    await mailService.sendChangePasswordMail(email, changePasswordLink);
  }
}

export default new UserService();
