import { JwtPayload } from "jsonwebtoken";

export interface ITokenService {
  generateTokens(payload: object): { accessToken: string; refreshToken: string };
  validateAccessToken(token: string): JwtPayload | null;
  validateRefreshToken(token: string): JwtPayload | null;
  saveToken(userId: string, refreshToken: string): Promise<Document>;
  removeToken(refreshToken: string): Promise<{ deletedCount?: number }>;
  findToken(refreshToken: string): Promise<Document | null>;
}