const NotificationModel = require('../models/Notification');

class NotificationService  {
  async createNotification(userId, text) {
    const notification = await NotificationModel.create({ userId, text })
    return notification;
  }

  async getNotification(taskId, userId) {
    const notification = await NotificationModel.find({ userId, taskId });
    return notification;
  }

  async deleteNotification(notificationId) {
    const notification = await NotificationModel.findByIdAndDelete(notificationId);
    return notification;
  }

  async getAllNotifications(userId) {
    const notifications = await NotificationModel.find(userId);
    return notifications;
  }
}

module.exports = new NotificationService()