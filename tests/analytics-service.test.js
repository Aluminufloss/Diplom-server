const AnalyticsService = require("../service/analytics-service");
const TaskService = require("../service/task-service");
const ListService = require("../service/list-service");
const TaskModel = require("../models/Task");
const ListModel = require("../models/List");
const TaskCompletionModel = require("../models/TaskCompletion");
const ApiError = require("../exceptions/api-error");

jest.mock("../service/task-service");
jest.mock("../service/list-service");
jest.mock("../models/Task");
jest.mock("../models/List");
jest.mock("../models/TaskCompletion");
jest.mock("../exceptions/api-error");

describe("AnalyticsService", () => {
  describe("_getAnalyticsByTasks", () => {
    it("should return analytics for tasks", async () => {
      // Mock data
      const tasks = [
        {
          status: "completed",
          priority: "high",
          category: "Personal",
          timeDuration: { hours: 1, minutes: 30 },
        },
        {
          status: "active",
          priority: "medium",
          category: "Work",
          timeDuration: { hours: 0, minutes: 45 },
        },
      ];

      // Mock TaskModel.find to return tasks
      TaskModel.find.mockResolvedValue(tasks);

      // Call the method
      const result = await AnalyticsService._getAnalyticsByTasks(tasks);

      // Assertion
      expect(result).toEqual({
        priorityAnalytics: { low: 0, medium: 1, high: 1 },
        tasksAnalytics: { completed: 1, expired: 0, active: 1, tasksLength: 2 },
        categoriesAnalytics: {
          Personal: { numberOfTasks: 1, totalTime: { hours: 1, minutes: 30 } },
          Work: { numberOfTasks: 1, totalTime: { hours: 0, minutes: 45 } },
          Home: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
          Study: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
          Without: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
          Travelling: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
        },
      });
    });
  });

  describe("_getAnalyticsByTasksCompletions", () => {
    it("should return analytics for tasks completions", async () => {
      // Mock data
      const completions = [
        {
          statuses: ["completed"],
          priorities: ["high"],
          categories: ["Personal"],
          completedAt: [new Date().toISOString()],
          timeDurations: [{ hours: 1, minutes: 30 }],
        },
        {
          statuses: ["active"],
          priorities: ["medium"],
          categories: ["Work"],
          completedAt: [new Date().toISOString()],
          timeDurations: [{ hours: 0, minutes: 45 }],
        },
      ];
  
      const startDate = new Date().setDate(new Date().getDate() - 1);
      const endDate = new Date().setDate(new Date().getDate() - 1);
  
      // Mock TaskCompletionModel.find to return completions
      TaskCompletionModel.find.mockResolvedValue(completions);
  
      // Call the method
      const result = await AnalyticsService._getAnalyticsByTasksCompletions({
        completions,
        startDate,
        endDate,
      });
  
      // Update the expected result to match the mock data
      expect(result).toEqual({
        priorityAnalytics: { low: 0, medium: 1, high: 1 },
        tasksAnalytics: { completed: 1, expired: 0, active: 1, tasksLength: 2 },
        categoriesAnalytics: {
          Personal: { numberOfTasks: 1, totalTime: { hours: 1, minutes: 30 } },
          Work: { numberOfTasks: 1, totalTime: { hours: 0, minutes: 0 } },
          Home: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
          Study: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
          Without: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
          Travelling: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
        },
      });
    });
  });  

  describe("_getAnalyticsByDates", () => {
    it("should return analytics by dates", async () => {
      // Mock data
      const userId = "userId";
      const startDate = new Date();
      const endDate = new Date();
      const completions = [
        {
          taskId: "taskId",
          completedAt: [new Date()],
          statuses: ["active"],
          timeDurations: [{ hours: 0, minutes: 0 }],
          priorities: ["high"],
          categories: ["Personal"],
        },
      ];
  
      const tasksAnalytics = {
        completed: 0,
        expired: 0,
        active: 1,
        tasksLength: 1,
      };
  
      // Initialize categoriesAnalytics properly
      const categoriesAnalytics = {
        Personal: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
        Work: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
        Home: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
        Study: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
        Without: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
        Travelling: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
      };
  
      // Mock TaskCompletionModel.find to return completions
      TaskCompletionModel.find.mockResolvedValue(completions);
  
      // Call the method
      const result = await AnalyticsService._getAnalyticsByDates(
        userId,
        startDate,
        endDate
      );
  
      // Assertion
      expect(result).toEqual({
        tasksAnalytics,
        priorityAnalytics: { low: 0, medium: 0, high: 1 },
        categoriesAnalytics,
      });
    });
  });
  

  describe("_getComparisonAnalyticsByWeek", () => {
    it("should return comparison analytics for the current week and the previous week", async () => {
      // Mock data
      const userId = "userId";
      const currentDate = new Date();
      const currentDay = currentDate.getDay();
      const thisWeekStartDate = new Date(currentDate);
      thisWeekStartDate.setDate(
        currentDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1)
      );
      const thisWeekEndDate = new Date(currentDate);
      thisWeekEndDate.setDate(currentDate.getDate() - currentDay + 7);
      const lastWeekStartDate = new Date(thisWeekStartDate);
      lastWeekStartDate.setDate(thisWeekStartDate.getDate() - 7);
      const lastWeekEndDate = new Date(thisWeekEndDate);
      lastWeekEndDate.setDate(thisWeekEndDate.getDate() - 7);
      const thisWeekAnalytics = {
        tasksAnalytics: {},
        priorityAnalytics: {},
        categoriesAnalytics: {},
      };
      const lastWeekAnalytics = {
        tasksAnalytics: {},
        priorityAnalytics: {},
        categoriesAnalytics: {},
      };

      // Mock the _getAnalyticsByDates method to return analytics for the current week and the previous week
      AnalyticsService._getAnalyticsByDates = jest
        .fn()
        .mockImplementationOnce(() => thisWeekAnalytics)
        .mockImplementationOnce(() => lastWeekAnalytics);

      // Call the method
      const result = await AnalyticsService.getComparisonAnalyticsByWeek(
        userId
      );

      // Assertion
      expect(result).toEqual({
        tasks: {
          thisWeek: thisWeekAnalytics.tasksAnalytics,
          lastWeek: lastWeekAnalytics.tasksAnalytics,
        },
        priority: {
          thisWeek: thisWeekAnalytics.priorityAnalytics,
          lastWeek: lastWeekAnalytics.priorityAnalytics,
        },
        categories: {
          thisWeek: thisWeekAnalytics.categoriesAnalytics,
          lastWeek: lastWeekAnalytics.categoriesAnalytics,
        },
      });
    });
  });

  describe("_getComparisonAnalyticsByMonth", () => {
    it("should return comparison analytics for the current month and the previous month", async () => {
      // Mock data
      const userId = "userId";
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const thisMonthAnalytics = {
        tasksAnalytics: {},
        priorityAnalytics: {},
        categoriesAnalytics: {},
      };
      const lastMonthAnalytics = {
        tasksAnalytics: {},
        priorityAnalytics: {},
        categoriesAnalytics: {},
      };

      // Mock the _getAnalyticsByDates method to return analytics for the current month and the previous month
      AnalyticsService._getAnalyticsByDates = jest
        .fn()
        .mockImplementationOnce(() => thisMonthAnalytics)
        .mockImplementationOnce(() => lastMonthAnalytics);

      // Call the method
      const result = await AnalyticsService.getComparisonAnalyticsByMonth(
        userId
      );

      // Assertion
      expect(result).toEqual({
        tasks: {
          thisMonth: thisMonthAnalytics.tasksAnalytics,
          lastMonth: lastMonthAnalytics.tasksAnalytics,
        },
        priority: {
          thisMonth: thisMonthAnalytics.priorityAnalytics,
          lastMonth: lastMonthAnalytics.priorityAnalytics,
        },
        categories: {
          thisMonth: thisMonthAnalytics.categoriesAnalytics,
          lastMonth: lastMonthAnalytics.categoriesAnalytics,
        },
      });
    });
  });

  describe("getAnalyticsByYear", () => {
    it("should return analytics for the entire year", async () => {
      // Mock data
      const userId = "userId";
      const completions = [
        {
          taskId: "taskId",
          completedAt: new Date(),
          statuses: ["completed"],
          timeDurations: [{ hours: 0, minutes: 0 }],
          priorities: ["high"],
          categories: ["Personal"],
        },
      ];
  
      const analyticsByMonth = [
        {
          month: 0,
          tasksCount: 1,
          tasksAnalytics: {},
          priorityAnalytics: {},
          categoriesAnalytics: {},
        },
      ];
  
      // Mock TaskCompletionModel.find to return completions
      TaskCompletionModel.find.mockResolvedValue(completions);
  
      // Mock _getAnalyticsByTasksCompletions method to return analytics for each month
      AnalyticsService._getAnalyticsByTasksCompletions = jest
        .fn()
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});
  
      // Call the method
      const result = await AnalyticsService.getAnalyticsByYear(userId);
  
      // Update the expected result to match the mock data
      expect(result).toEqual(analyticsByMonth);
    });
  });  
});
