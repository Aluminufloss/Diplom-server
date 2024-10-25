import { Request, Response, NextFunction } from "express";
import UserDto from "../dtos/user-dto";
import UserService from "../service/user-service";

class UserController {
  async registration(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email, password, username } = req.body;
      const userData = await UserService.registration(email, password, username);

      if (!userData) {
        return;
      }

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

  async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email, password, shouldRememberMe } = req.body;

      const userData = await UserService.login(email, password);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: shouldRememberMe ? 30 * 24 * 60 * 60 * 1000 : 1 * 24 * 60 * 60 * 1000,
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

  async logout(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { refreshToken } = req.cookies;
      const token = await UserService.logout(refreshToken);

      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");

      return res.json(token);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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

  async activate(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const activationLink = req.params.link;
      await UserService.activate(activationLink);

      return res.redirect(`${process.env.CLIENT_URL}/login`);
    } catch (e) {
      next(e);
    }
  }

  async sendChangePasswordLink(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email } = req.body;
      await UserService.sendChangePasswordLink(email);
      return res.json({ message: "Message sent successfully" });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { password, urlString } = req.body;
      await UserService.changePassword(password, urlString);
      return res.json({ message: "Password was changed successfully" });
    } catch (err) {
      next(err);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = new UserDto(req.user);
      return res.json({ ...user });
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();
