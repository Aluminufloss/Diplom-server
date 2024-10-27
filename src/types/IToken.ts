import { Types } from "mongoose";

export interface IToken {
  user: Types.ObjectId;
  refreshToken: string;
  accessToken: string;
}

export type TokensType = {
  accessToken: string;
  refreshToken: string;
};

export interface ITokenDocument extends IToken, Document {}