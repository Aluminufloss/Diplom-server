import { Types } from "mongoose";

export interface IToken {
  user: Types.ObjectId;
  refreshToken: string;
}