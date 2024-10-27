import { Model, Schema, model } from "mongoose";
import { ITokenDocument } from "@/types/IToken";

const TokenSchema = new Schema<ITokenDocument>({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  refreshToken: { type: String, required: true },
});

const TokenModel: Model<ITokenDocument> = model<ITokenDocument>("User", TokenSchema);

export default TokenModel;