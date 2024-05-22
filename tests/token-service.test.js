const jwt = require("jsonwebtoken");
const tokenModel = require("../models/Token");
const TokenService = require("../service/token-service");

jest.mock("jsonwebtoken");
jest.mock("../models/Token");

describe("TokenService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("generateTokens", () => {
    it("should generate access and refresh tokens", () => {
      const payload = { id: "userId", email: "test@example.com" };
      const mockAccessToken = "mockAccessToken";
      const mockRefreshToken = "mockRefreshToken";

      jwt.sign
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const tokens = TokenService.generateTokens(payload);

      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        process.env.JWT_ACCESS_SECRET,
        {
          expiresIn: "30m",
        }
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        process.env.JWT_REFRESH_SECRET,
        {
          expiresIn: "30d",
        }
      );
      expect(tokens).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });
  });

  describe("validateAccessToken", () => {
    it("should return user data if the access token is valid", () => {
      const token = "validAccessToken";
      const mockUserData = { id: "userId", email: "test@example.com" };

      jwt.verify.mockReturnValue(mockUserData);

      const userData = TokenService.validateAccessToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        process.env.JWT_ACCESS_SECRET
      );
      expect(userData).toEqual(mockUserData);
    });

    it("should return null if the access token is invalid", () => {
      const token = "invalidAccessToken";

      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const userData = TokenService.validateAccessToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        process.env.JWT_ACCESS_SECRET
      );
      expect(userData).toBeNull();
    });
  });

  describe("validateRefreshToken", () => {
    it("should return user data if the refresh token is valid", () => {
      const token = "validRefreshToken";
      const mockUserData = { id: "userId", email: "test@example.com" };

      jwt.verify.mockReturnValue(mockUserData);

      const userData = TokenService.validateRefreshToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        process.env.JWT_REFRESH_SECRET
      );
      expect(userData).toEqual(mockUserData);
    });

    it("should return null if the refresh token is invalid", () => {
      const token = "invalidRefreshToken";

      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const userData = TokenService.validateRefreshToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        process.env.JWT_REFRESH_SECRET
      );
      expect(userData).toBeNull();
    });
  });

  describe("saveToken", () => {
    it("should update the refresh token if token data exists", async () => {
      const userId = "userId";
      const refreshToken = "newRefreshToken";
      const mockTokenData = {
        user: userId,
        refreshToken: "oldRefreshToken",
        save: jest.fn(),
      };

      tokenModel.findOne.mockResolvedValue(mockTokenData);

      await TokenService.saveToken(userId, refreshToken);

      expect(tokenModel.findOne).toHaveBeenCalledWith({ user: userId });
      expect(mockTokenData.refreshToken).toBe(refreshToken);
      expect(mockTokenData.save).toHaveBeenCalled();
    });

    it("should create a new token if token data does not exist", async () => {
      const userId = "userId";
      const refreshToken = "newRefreshToken";

      tokenModel.findOne.mockResolvedValue(null);
      tokenModel.create.mockResolvedValue({ user: userId, refreshToken });

      await TokenService.saveToken(userId, refreshToken);

      expect(tokenModel.findOne).toHaveBeenCalledWith({ user: userId });
      expect(tokenModel.create).toHaveBeenCalledWith({
        user: userId,
        refreshToken,
      });
    });
  });

  describe("removeToken", () => {
    it("should remove the refresh token", async () => {
      const refreshToken = "refreshToken";
      tokenModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await TokenService.removeToken(refreshToken);

      expect(tokenModel.deleteOne).toHaveBeenCalledWith({ refreshToken });
      expect(result).toEqual({ deletedCount: 1 });
    });
  });

  describe("findToken", () => {
    it("should find and return the token data", async () => {
      const refreshToken = "refreshToken";
      const mockTokenData = { user: "userId", refreshToken };

      tokenModel.findOne.mockResolvedValue(mockTokenData);

      const result = await TokenService.findToken(refreshToken);

      expect(tokenModel.findOne).toHaveBeenCalledWith({ refreshToken });
      expect(result).toEqual(mockTokenData);
    });
  });
});
