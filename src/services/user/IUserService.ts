import { UserApiRequestType, UserApiResponseType } from "@/types/IUser";

export interface IUserService {
  registration(options: UserApiRequestType): Promise<UserApiResponseType>;
  login(email: string, password: string): Promise<UserApiResponseType>;
  logout(refreshToken: string): Promise<void>;
  refresh(refreshToken: string): Promise<UserApiResponseType>;
  activate(activationLink: string): Promise<void>;
  sendChangePasswordLink(email: string): Promise<void>;
  changePassword(password: string, urlString: string): Promise<void>;
}
