const bcrypt = require("bcrypt");
const uuid = require("uuid");

const UserModel = require("../models/User");

const UserDto = require("../dtos/user-dto");
const ApiError = require("../exceptions/api-error");

const tokenService = require("./token-service");
const mailService = require("./mail-service");

const {
  encryptAndFormatAsUuid,
  decryptFormattedUuid,
} = require("../utils/cryptEmail");

class UserService {
  async generateTokens(user) {
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async registration(email, password, username) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(
        `Пользователь с данным email уже зарегистрирован`
      );
    }

    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4();

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

    return { ...tokens, user: userDto };
  }

  async login(email, password) {
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

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest("Неккоректная ссылка активации");
    }
    user.isActivated = true;
    await user.save();
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError("You don't have refresh token");
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await tokenService.findToken(refreshToken);
    if (!userData) {
      throw ApiError.UnauthorizedError("Token didn't validate correctly");
    }

    if (!tokenFromDB) {
      throw ApiError.UnauthorizedError("Token doesn't exist in database");
    }

    const user = await UserModel.findById(userData.id);

    return this.generateTokens(user);
  }

  async changePassword(password, urlString) {
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

  async getUser(refreshToken) {
    if (!refreshToken) {
      return { user: {} };
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await tokenService.findToken(refreshToken);
    if (!userData) {
      throw ApiError.UnauthorizedError("Token didn't validate correctly");
    }

    if (!tokenFromDB) {
      throw ApiError.UnauthorizedError("Token doesn't exist in database");
    }

    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);

    return { user: userDto };
  }

  async sendChangePasswordLink(email) {
    const generatedLink = encryptAndFormatAsUuid(email);
    const changePasswordLink = `${process.env.CLIENT_URL}/changePassword/${generatedLink}`;
    await mailService.sendChangePasswordMail(email, changePasswordLink);
  }
}

module.exports = new UserService();
