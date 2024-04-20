const userService = require("../service/user-service");

class UserContoller {
  async registration(req, res, next) {
    try {
      const { email, password, username } = req.body;
      const userData = await userService.registration(
        email,
        password,
        username
      );

      if (!userData) {
        return;
      }

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      res.cookie("accessToken", userData.accessToken, {
        maxAge: 1 * 1 * 60 * 60 * 1000,
        httpOnly: true,
      })

      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password, shouldRememberMe } = req.body;
      
      const userData = await userService.login(email, password);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: shouldRememberMe
          ? 30 * 24 * 60 * 60 * 1000
          : 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      res.cookie("accessToken", userData.accessToken, {
        maxAge: 1 * 1 * 15 * 60 * 1000,
        httpOnly: true,
      })

      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);

      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");

      return res.json(token);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userService.refresh(refreshToken);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await userService.activate(activationLink);

      return res.redirect(`${process.env.CLIENT_URL}/login`);
    } catch (e) {
      next(e);
    }
  }

  async sendChangePasswordLink(req, res, next) {
    try {
      const { email } = req.body;
      await userService.sendChangePasswordLink(email);
      return res.json({ message: "Message sended successfully" });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { password, urlString } = req.body;
      await userService.changePassword(password, urlString);
      return res.json({ message: "Password was changed successfully" });
    } catch (err) {
      next(err);
    }
  }

  async getUser(req, res, next) {
    try {
      return res.json(req.user);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserContoller();
