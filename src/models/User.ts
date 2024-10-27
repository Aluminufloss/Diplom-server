import { Schema, model } from "mongoose";
import { IUser } from "../types/IUser";

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isActivated: { type: Boolean, default: false },
  lastPasswords: { type: [String], default: [] },
  activationLink: { type: String },
  username: { type: String },
})

export default model('User', UserSchema);