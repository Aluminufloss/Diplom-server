const bcrypt = require("bcrypt");
const uuid = require("uuid");

const UserService = require("../service/user-service");
const UserModel = require("../models/User");
const tokenService = require("../service/token-service");
const mailService = require("../service/mail-service");
const listService = require("../service/list-service");
const ApiError = require("../exceptions/api-error");

jest.mock("../models/User");
jest.mock("../service/token-service");
jest.mock("../service/mail-service");
jest.mock("../service/list-service");
jest.mock("bcrypt");
jest.mock("uuid");

describe("UserService", () => {
  afterEach(async () => {
    await UserModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe("registration", () => {
    it("should register a new user", async () => {
      const mockEmail = "test@example.com";
      const mockPassword = "password";
      const mockUsername = "testuser";
      const mockHashPassword = "hashedPassword";
      const mockActivationLink = "activationLink";

      UserModel.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(mockHashPassword);
      uuid.v4.mockReturnValue(mockActivationLink);
      UserModel.create.mockResolvedValue({
        id: "userId", // Ensure the mock user object contains an id
        email: mockEmail,
        password: mockHashPassword,
        username: mockUsername,
        activationLink: mockActivationLink,
      });

      tokenService.generateTokens.mockReturnValue({
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      });

      const result = await UserService.registration(
        mockEmail,
        mockPassword,
        mockUsername
      );

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, 3);
      expect(UserModel.create).toHaveBeenCalledWith({
        email: mockEmail,
        password: mockHashPassword,
        username: mockUsername,
        activationLink: mockActivationLink,
        lastPasswords: [mockHashPassword],
      });
      expect(mailService.sendActivationMail).toHaveBeenCalledWith(
        mockEmail,
        `${process.env.API_URL}/activate/${mockActivationLink}`
      );
      expect(tokenService.saveToken).toHaveBeenCalledWith(
        "userId", // Ensure this matches the id field in the mock user object
        "refreshToken"
      );
      expect(listService.createGeneralLists).toHaveBeenCalledWith("userId");
      expect(result).toHaveProperty("accessToken", "accessToken");
      expect(result).toHaveProperty("refreshToken", "refreshToken");
      expect(result).toHaveProperty("user");
    });

    it("should throw an error if the user already exists", async () => {
      UserModel.findOne.mockResolvedValue({});

      await expect(
        UserService.registration("test@example.com", "password", "testuser")
      ).rejects.toThrow(
        "Пользователь с данным email уже зарегистрирован"
      );
    });
  });

  describe("login", () => {
    it("should log in an existing user", async () => {
      const mockEmail = "test@example.com";
      const mockPassword = "password";
      const mockHashPassword = "hashedPassword";

      UserModel.findOne.mockResolvedValue({
        id: "userId", // Ensure the mock user object contains an id
        email: mockEmail,
        password: mockHashPassword,
        isActivated: true,
      });
      bcrypt.compare.mockResolvedValue(true);

      tokenService.generateTokens.mockReturnValue({
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      });

      const result = await UserService.login(mockEmail, mockPassword);

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockPassword,
        mockHashPassword
      );
      expect(tokenService.saveToken).toHaveBeenCalledWith(
        "userId", // Ensure this matches the id field in the mock user object
        "refreshToken"
      );
      expect(result).toHaveProperty("accessToken", "accessToken");
      expect(result).toHaveProperty("refreshToken", "refreshToken");
      expect(result).toHaveProperty("user");
    });

    it("should throw an error if the user is not found", async () => {
      UserModel.findOne.mockResolvedValue(null);

      await expect(
        UserService.login("test@example.com", "password")
      ).rejects.toThrow(
        "Пользователь с таким email не был найден"
      );
    });

    it("should throw an error if the password is incorrect", async () => {
      UserModel.findOne.mockResolvedValue({
        email: "test@example.com",
        password: "hashedPassword",
      });
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        UserService.login("test@example.com", "password")
      ).rejects.toThrow(
        "Проверьте корректность введённых данных"
      );
    });

    it("should throw an error if the account is not activated", async () => {
      UserModel.findOne.mockResolvedValue({
        email: "test@example.com",
        password: "hashedPassword",
        isActivated: false,
      });
      bcrypt.compare.mockResolvedValue(true);

      await expect(
        UserService.login("test@example.com", "password")
      ).rejects.toThrow("Аккаунт не активирован");
    });
  });

  describe("activate", () => {
    it("should activate the user account", async () => {
      const mockActivationLink = "activationLink";
      UserModel.findOne.mockResolvedValue({
        email: "test@example.com",
        isActivated: false,
        save: jest.fn(),
      });

      await UserService.activate(mockActivationLink);

      const user = await UserModel.findOne({
        activationLink: mockActivationLink,
      });
      expect(user.isActivated).toBe(true);
      expect(user.save).toHaveBeenCalled();
    });

    it("should throw an error if the activation link is invalid", async () => {
      UserModel.findOne.mockResolvedValue(null);

      await expect(UserService.activate("invalidLink")).rejects.toThrow(
        "Неккоректная ссылка активации"
      );
    });
  });
});
