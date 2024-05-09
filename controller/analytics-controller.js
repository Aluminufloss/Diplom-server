const AnalyticsService = require("../service/analytics-service");

class AnalyticsController {
  async getTodayAnalytics(req, res, next) {
    try {
      const { id } = req.user;
      const analytics = await AnalyticsService.getTodayAnalytics(id);
      return res.json(analytics);
    } catch (err) {
      next(err);
    }
  }

  async getPlannedAnalytics(req, res, next) {
    try {
      const { id } = req.user;
      const analytics = await AnalyticsService.getPlannedAnalytics(id);
      return res.json(analytics);
    } catch (err) {
      next(err);
    }
  }

  async getAllAnalytics(req, res, next) {
    try {
      const { id } = req.user;
      const analytics = await AnalyticsService.getAllAnalytics(id);
      return res.json(analytics);
    } catch (err) {
      next(err);
    }
  }

  async getAnaliticsByList(req, res, next) {
    try {
      const { id } = req.user;
      const { listId } = req.body;
      const analytics = await AnalyticsService.getAnaliticsByList(id, listId);
      return res.json(analytics);
    } catch (err) {
      next(err);
    }
  }

  async getAnaliticsByGroup(req, res, next) {
    try {
      const { id } = req.user;
      const { groupId } = req.body;
      const analytics = await AnalyticsService.getAnaliticsByGroup(id, groupId);
      return res.json(analytics);
    } catch (err) {
      next(err);
    }
  }

  async getAnalyticsByWeek(req, res, next) {
    try {
      const { id } = req.user;
      const analytics = await AnalyticsService.getAnalyticsByWeek(id);
      return res.json(analytics);
    } catch (err) {
      next(err);
    }
  }

  async getAnalyticsByMonth(req, res, next) {
    try {
      const { id } = req.user;
      const analytics = await AnalyticsService.getAnalyticsByMonth(id);
      return res.json(analytics);
    } catch (err) {
      next(err);
    }
  } 
}

module.exports = new AnalyticsController()