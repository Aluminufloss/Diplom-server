import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

import UserModel from "../../models/User";

import { IUserService } from "./IUserService";

import listService from "../list-service";
import tokenService from "../token/token-service";
import mailService from "../mail-service";

import UserDto from "../../dtos/user-dto";

import {
  encryptAndFormatAsUuid,
  decryptFormattedUuid,
} from "../../utils/cryptEmail";

import ApiError from "../../exceptions/api-error";

class UserService implements IUserService {
  async generateTokens(user: any) {
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async registration(email: string, password: string, username: string) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(
        `Пользователь с данным email уже зарегистрирован`
      );
    }

    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuidv4();

    const user = await UserModel.create({
      email,
      password: hashPassword,
      username: username,
      activationLink,
      lastPasswords: [hashPassword],
    });

    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/activate/${activationLink}`
    );

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    await listService.createGeneralLists(userDto.id);

    return { ...tokens, user: userDto };
  }

  async login(email: string, password: string) {
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

  async logout(refreshToken: string) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async activate(activationLink: string) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest("Неккоректная ссылка активации");
    }
    user.isActivated = true;
    await user.save();
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError("У вас нету refresh токена");
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await tokenService.findToken(refreshToken);
    if (!userData) {
      throw ApiError.UnauthorizedError("Токен не был валидирован корректно");
    }

    if (!tokenFromDB) {
      throw ApiError.UnauthorizedError("Токен не существует в базе данных");
    }

    const user = await UserModel.findById(userData.id);
    return this.generateTokens(user);
  }

  async changePassword(password: string, urlString: string) {
    const email = decryptFormattedUuid(urlString);
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw ApiError.BadRequest("Пользователь с таким email не был найден");
    }

    const isThisPasswordUsed = user.lastPasswords.some((pass) => {
      return bcrypt.compareSync(password, pass);
    });

    if (isThisPasswordUsed) {
      throw ApiError.BadRequest("Пароль совпадает с раннее использованным");
    }

    const hashPassword = await bcrypt.hash(password, 3);

    await UserModel.updateOne(
      { email },
      {
        password: hashPassword,
        lastPasswords: [...user.lastPasswords, hashPassword],
      }
    );
  }

  async getUser(refreshToken: string) {
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
    const userDto = new UserDto(user);

    return { user: userDto };
  }

  async sendChangePasswordLink(email: string) {
    const generatedLink = encryptAndFormatAsUuid(email);
    const changePasswordLink = `${process.env.CLIENT_URL}/changePassword/${generatedLink}`;
    await mailService.sendChangePasswordMail(email, changePasswordLink);
  }
}

export default new UserService();
