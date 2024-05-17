const AnalyticsService = require("../service/analytics-service");

class AnalyticsController {
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

  async getComparisonAnalyticsByWeek(req, res, next) {
    try {
      const { id } = req.user;
      const analytics = await AnalyticsService.getComparisonAnalyticsByWeek(id);
      return res.json(analytics);
    } catch (err) {
      next(err);
    }
  }

  async getComparisonAnalyticsByMonth(req, res, next) {
    try {
      const { id } = req.user;
      const analytics = await AnalyticsService.getComparisonAnalyticsByMonth(id);
      return res.json(analytics);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalyticsController()