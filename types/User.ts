export interface IUser {
  email: string;
  password: string;
  isActivated: boolean;
  lastPasswords: string[];
  activationLink?: string;
  username?: string;
}