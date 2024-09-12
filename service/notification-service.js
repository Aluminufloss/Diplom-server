const NotificationModel = require("../models/Notification");

class NotificationService {
  async createNotification(notification) {
    const newNotification = await NotificationModel.create(notification);
    return newNotification;
  }

  async getNotification(userId) {
    const notification = await NotificationModel.findOne({ userId });
    return notification;
  }

  async getAllNotifications(userId) {
    const notifications = await NotificationModel.find({ userId });
    return notifications;
  }

  async deleteNotification(notificationId) {
    await NotificationModel.deleteOne({ _id: notificationId });
  }

  async updateNotification(notificationId, notification) {
    await NotificationModel.updateOne({ _id: notificationId }, notification);
  }
}

module.exports = new NotificationService();
