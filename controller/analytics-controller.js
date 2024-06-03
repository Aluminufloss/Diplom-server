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

  async getComparisonAnalyticsByYear(req, res, next) {
    try {
      const { id } = req.user;
      const analytics = await AnalyticsService.getAnalyticsByYear(id);
      return res.json(analytics);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalyticsController();
