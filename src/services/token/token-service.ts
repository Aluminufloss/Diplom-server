import jwt, { JwtPayload } from "jsonwebtoken";

import { ITokenService } from "@services/token/ITokenService";

import tokenModel from "@models/Token";

import {
  ACCESS_TOKEN_EXPIRED_TIME,
  REFRESH_TOKEN_EXPIRED_TIME,
} from "@utils/constants";

import { IUserDto } from "@/types/IUser";
import { ITokenDocument, TokensType } from "@/types/IToken";

class TokenService implements ITokenService {
  /**
   * Generates access and refresh tokens for a given payload.
   * @param payload - The user data used for token generation.
   * @returns An object containing the access and refresh tokens.
   */
  public generateTokens(payload: IUserDto): TokensType {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRED_TIME,
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRED_TIME,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Validates an access token and returns the user data if valid.
   * @param token - The access token to validate.
   * @returns The user data if the token is valid, null otherwise.
   */
  public validateAccessToken(token: string): JwtPayload | null {
    try {
      const userData = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET,
      ) as JwtPayload;
      return userData;
    } catch (err) {
      return null;
    }
  }

  /**
   * Validates a refresh token and returns the user data if valid.
   * @param token - The refresh token to validate.
   * @returns The user data if the token is valid, null otherwise.
   */
  public validateRefreshToken(token: string): JwtPayload | null {
    try {
      const userData = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET,
      ) as JwtPayload;

      return userData;
    } catch (err) {
      return null;
    }
  }

  /**
   * Saves or updates a refresh token for a given user.
   * @param userId - The ID of the user.
   * @param refreshToken - The refresh token to save.
   * @returns The saved token document.
   */
  public async saveToken(
    userId: string,
    refreshToken: string,
  ): Promise<ITokenDocument> {
    const tokenData = await tokenModel.findOne({ user: userId });

    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }

    const token = await tokenModel.create({ user: userId, refreshToken });
    return token;
  }

  /**
   * Removes a refresh token.
   * @param refreshToken - The refresh token to remove.
   * @returns Result of the deletion operation.
   */
  public async removeToken(refreshToken: string): Promise<void> {
    await tokenModel.deleteOne({ refreshToken });
  }

  /**
   * Finds a token document by refresh token.
   * @param refreshToken - The refresh token to search for.
   * @returns The token document if found, null otherwise.
   */
  public async findToken(refreshToken: string): Promise<ITokenDocument | null> {
    const tokenData = await tokenModel.findOne({ refreshToken });
    return tokenData;
  }
}

export default new TokenService();
