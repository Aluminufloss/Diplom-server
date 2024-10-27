import { Request, Response, NextFunction } from "express";

import UserService from "@services/user/user-service";

import UserDto from "@dtos/user-dto";

import { UserApiRequestType, UserApiResponseType } from "@/types/IUser";

class UserController {
  /**
   * Registers a new user
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next middleware function
   */
  async registration(
    req: Request<{}, {}, UserApiRequestType>,
    res: Response<UserApiResponseType>,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { email, password, username } = req.body;
      const userData = await UserService.registration({
        email,
        password,
        username,
      });

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      res.cookie("accessToken", userData.accessToken, {
        maxAge: 1 * 15 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Logs in an existing user
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next middleware function
   */
  async login(
    req: Request<{}, {}, UserApiRequestType>,
    res: Response<UserApiResponseType>,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { email, password, shouldRememberMe } = req.body;
      const userData = await UserService.login(email, password);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: shouldRememberMe
          ? 30 * 24 * 60 * 60 * 1000
          : 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      res.cookie("accessToken", userData.accessToken, {
        maxAge: 1 * 15 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Logs out a user
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next middleware function
   */
  async logout(
    req: Request,
    res: Response<string>,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { refreshToken } = req.cookies;

      const message = await UserService.logout(refreshToken);
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");

      return res.json(message);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Refreshes user tokens
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next middleware function
   */
  async refresh(
    req: Request,
    res: Response<UserApiResponseType>,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { refreshToken } = req.cookies;
      const userData = await UserService.refresh(refreshToken);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      res.cookie("accessToken", userData.accessToken, {
        maxAge: 1 * 15 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Activates a user account
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next middleware function
   */
  async activate(
    req: Request<{ link: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const activationLink = req.params.link;
      await UserService.activate(activationLink);

      return res.redirect(`${process.env.CLIENT_URL}/login`);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Sends a change password link to the user's email
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next middleware function
   */
  async sendChangePasswordLink(
    req: Request<{}, {}, { email: string }>,
    res: Response<string>,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { email } = req.body;

      await UserService.sendChangePasswordLink(email);
      return res.json("Message sent successfully");
    } catch (err) {
      next(err);
    }
  }

  /**
   * Changes the user's password
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next middleware function
   */
  async changePassword(
    req: Request<{}, {}, { password: string; urlString: string }>,
    res: Response<string>,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { password, urlString } = req.body;

      await UserService.changePassword(password, urlString);
      return res.json("Password was changed successfully");
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves the current user's data
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next middleware function
   */
  async getUser(
    req: Request<{}, {}, {}, { user: UserDto }>,
    res: Response<UserDto>,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const user = new UserDto(req.query.user);
      return res.json(user);
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();
