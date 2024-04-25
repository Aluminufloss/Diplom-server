const NotificationService = require("../service/notification-service");

class NotificationController {
  async createNotification(req, res) {
    const { userId, text } = req.body;
    const notification = await NotificationService.createNotification(userId, text);
    return res.json(notification);
  }
}

module.exports = new NotificationController();