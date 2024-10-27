import { Model, Schema, model } from "mongoose";

import { IUserDocument } from "@/types/IUser";

const UserSchema = new Schema<IUserDocument>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isActivated: { type: Boolean, default: false },
  lastPasswords: { type: [String], default: [] },
  activationLink: { type: String },
  username: { type: String },
});

const UserModel: Model<IUserDocument> = model<IUserDocument>(
  "User",
  UserSchema,
);

export default UserModel;
