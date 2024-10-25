export interface IUserService {
  registration(email: string, password: string, username: string): Promise<any>;
  login(email: string, password: string): Promise<any>;
  logout(refreshToken: string): Promise<any>;
  refresh(refreshToken: string): Promise<any>;
  activate(activationLink: string): Promise<void>;
  sendChangePasswordLink(email: string): Promise<void>;
  changePassword(password: string, urlString: string): Promise<void>;
}
