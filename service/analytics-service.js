const GeneralListsModel = require("../models/GeneralLists");

const TaskService = require("../service/task-service");
const ListService = require("../service/list-service");
const GroupService = require("../service/group-service");

const TaskModel = require("../models/Task");

const ApiError = require("../exceptions/api-error");

class AnalyticsService {
  async _getAnalyticsByTasks(tasks) {
    const priorityAnalytics = {
      low: 0,
      medium: 0,
      high: 0,
      without: 0,
    };

    const tasksAnalytics = {
      completed: 0,
      expired: 0,
      active: 0,
      tasksLength: 0,
    };

    const categoriesAnalytics = {
      Personal: 0,
      Work: 0,
      Study: 0,
      Home: 0,
      Travelling: 0,
      Without: 0,
    };

    for (const taskId of tasks) {
      const task = await TaskService.getTask(taskId);

      switch (task.priority) {
        case "low":
          priorityAnalytics.low += 1;
          break;
        case "medium":
          priorityAnalytics.medium += 1;
          break;
        case "high":
          priorityAnalytics.high += 1;
          break;
        case "without":
          priorityAnalytics.without += 1;
          break;
      }

      switch (task.status) {
        case "completed":
          tasksAnalytics.completed += 1;
          break;
        case "active":
          tasksAnalytics.active += 1;
          break;
        case "expired":
          tasksAnalytics.expired += 1;
          break;
      }

      switch (task.category) {
        case "Personal":
          categoriesAnalytics.Personal += 1;
          break;
        case "Work":
          categoriesAnalytics.Work += 1;
          break;
        case "Study":
          categoriesAnalytics.Study += 1;
          break;
        case "Home":
          categoriesAnalytics.Home += 1;
          break;
        case "Travelling":
          categoriesAnalytics.Travelling += 1;
          break;
        default:
          categoriesAnalytics.Without += 1;
          break;
      }
    }

    tasksAnalytics.tasksLength = tasks.length;

    return {
      priorityAnalytics,
      tasksAnalytics,
      categoriesAnalytics,
    };
  }

  async getTodayAnalytics(userId) {
    const generalLists = await GeneralListsModel.findOne({ userId });

    if (!generalLists) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }

    const todayTasks = generalLists.todayList.tasks;

    const { tasksAnalytics, priorityAnalytics, categoriesAnalytics } =
      await this._getAnalyticsByTasks(todayTasks);

    return {
      tasksAnalytics,
      priorityAnalytics,
      categoriesAnalytics,
    };
  }

  async getPlannedAnalytics(userId) {
    const generalLists = await GeneralListsModel.findOne({ userId });

    if (!generalLists) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }

    const plannedTasks = generalLists.plannedList.tasks;

    const { tasksAnalytics, priorityAnalytics, categoriesAnalytics } =
      await this._getAnalyticsByTasks(plannedTasks);

    return {
      tasksAnalytics,
      priorityAnalytics,
      categoriesAnalytics,
    };
  }

  async getAllAnalytics(userId) {
    const generalLists = await GeneralListsModel.findOne({ userId });

    if (!generalLists) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }

    const allTasks = generalLists.allTasksList.tasks;

    const { tasksAnalytics, priorityAnalytics, categoriesAnalytics } =
      await this._getAnalyticsByTasks(allTasks);

    return {
      tasksAnalytics,
      priorityAnalytics,
      categoriesAnalytics,
    };
  }

  async getAnaliticsByList(listId) {
    const list = await ListService.getList(listId);

    if (!list) {
      throw ApiError.BadRequest("Неккоректный id списка");
    }

    const tasks = list.tasks;

    const { tasksAnalytics, priorityAnalytics, categoriesAnalytics } =
      await this._getAnalyticsByTasks(tasks);

    return {
      tasksAnalytics,
      priorityAnalytics,
      categoriesAnalytics,
    };
  }

  async getAnaliticsByGroup(groupId) {
    const group = await GroupService.getGroup(groupId);

    if (!group) {
      throw ApiError.BadRequest("Неккоректный id группы");
    }

    const priorityAnalyticsResult = {
      low: 0,
      medium: 0,
      high: 0,
      without: 0,
    };

    const tasksAnalyticsResult = {
      completed: 0,
      expired: 0,
      active: 0,
    };

    const categoriesAnalyticsResult = {
      personal: 0,
      work: 0,
      Study: 0,
      Home: 0,
      Travelling: 0,
      Other: 0,
    };

    const groupLists = group.lists;

    for (const list of groupLists) {
      const { tasksAnalytics, priorityAnalytics, categoriesAnalytics } =
        await this.getAnaliticsByList(list);

      for (const key in tasksAnalytics) {
        tasksAnalyticsResult[key] += tasksAnalytics[key];
      }

      for (const key in priorityAnalytics) {
        priorityAnalyticsResult[key] += priorityAnalytics[key];
      }

      for (const key in categoriesAnalytics) {
        categoriesAnalyticsResult[key] += categoriesAnalytics[key];
      }
    }

    return {
      tasksAnalytics: tasksAnalyticsResult,
      priorityAnalytics: priorityAnalyticsResult,
      categoriesAnalytics: categoriesAnalyticsResult,
    };
  }

  async getAnalyticsByWeek(userId) {
    const currentDate = new Date();
    const currentDay = currentDate.getDay();

    const startDate = new Date(currentDate);
    startDate.setDate(
      currentDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1)
    );

    const endDate = new Date(currentDate);
    endDate.setDate(currentDate.getDate() - currentDay + 7);

    const tasks = TaskModel.find(
      {
        userId,
      },
      {
        $gte: startDate,
        $lte: endDate,
      }
    );

    console.log("tasks", tasks);

    const { tasksAnalytics, priorityAnalytics, categoriesAnalytics } =
      await this._getAnalyticsByTasks(tasks);

    return {
      tasksAnalytics,
      priorityAnalytics,
      categoriesAnalytics,
    };
  }

  async getAnalyticsByMonth(userId) {
    const currentDate = new Date();

    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const tasks = TaskModel.find(
      {
        userId,
      },
      {
        $gte: startOfMonth,
        $lte: endOfMonth,
      }
    );

    const { tasksAnalytics, priorityAnalytics, categoriesAnalytics } =
      await this._getAnalyticsByTasks(tasks);

    return {
      tasksAnalytics,
      priorityAnalytics,
      categoriesAnalytics,
    };
  }
}

module.exports = new AnalyticsService();