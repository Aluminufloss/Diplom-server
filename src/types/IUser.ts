export interface IUser {
  id: string;
  email: string;
  password: string;
  isActivated: boolean;
  lastPasswords: string[];
  activationLink?: string;
  username?: string;
}

export interface IUserDto {
  email: string;
  id: string;
  username?: string;
}

export type UserApiRequestType = {
  email: string;
  password: string;
  username?: string;
  shouldRememberMe?: boolean;
};

export type UserApiResponseType = {
  user: IUserDto;
  accessToken: string;
  refreshToken: string;
};

export type UserLoginRequestType = {
  email: string;
  password: string;
  shouldRememberMe?: boolean;
};

export interface IUserDocument extends IUser, Document {}
