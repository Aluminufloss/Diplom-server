import { JwtPayload } from "jsonwebtoken";

import { IUserDto } from "@/types/IUser";
import { ITokenDocument } from "@/types/IToken";

export interface ITokenService {
  generateTokens(payload: IUserDto): {
    accessToken: string;
    refreshToken: string;
  };
  validateAccessToken(token: string): JwtPayload | null;
  validateRefreshToken(token: string): JwtPayload | null;
  saveToken(userId: string, refreshToken: string): Promise<ITokenDocument>;
  removeToken(refreshToken: string): Promise<void>;
  findToken(refreshToken: string): Promise<ITokenDocument | null>;
}
