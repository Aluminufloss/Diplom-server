const NotificationService = require("../service/notification-service");

class notificationController {
  async createNotification(req, res, next) {
    try {
      const notification = await NotificationService.createNotification(
        req.body
      );
      return res.json(notification);
    } catch (err) {
      next(err);
    }
  }

  async getNotification(req, res, next) {
    try {
      const notifications = await NotificationService.getNotification(
        req.user.id
      );
      return res.json(notifications);
    } catch (err) {
      next(err);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      const notification = await NotificationService.deleteNotification(
        req.body
      );
      return res.json(notification);
    } catch (err) {
      next(err);
    }
  }

  async getAllNotifications(req, res, next) {
    try {
      const notifications = await NotificationService.getAllNotifications();
      return res.json(notifications);
    } catch (err) {
      next(err);
    }
  }

  async updateNotification(req, res, next) {
    try {
      const notification = await NotificationService.updateNotification(
        req.body
      );
      return res.json(notification);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new notificationController();
