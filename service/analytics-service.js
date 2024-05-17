const GeneralListsModel = require("../models/GeneralLists");

const TaskService = require("../service/task-service");
const ListService = require("../service/list-service");
const GroupService = require("../service/group-service");

const TaskModel = require("../models/Task");
const ListModel = require("../models/List");
const TaskCompletionModel = require("../models/TaskCompletion");

const { isFirstDateAfterSecond } = require("../utils/datesUtils");
const planeNewRepeatDate = require("../utils/planeNewRepeatDate");

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

  async _getAnalyticsByTasksCompletions(completions) {
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

    const priorityAnalytics = {
      low: 0,
      medium: 0,
      high: 0,
      without: 0,
    };

    for (const completion of completions) {
      switch (completion.status) {
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

      switch (completion.category) {
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

      switch (completion.priority) {
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
    }

    tasksAnalytics.tasksLength = completions.length;

    return {
      priorityAnalytics,
      tasksAnalytics,
      categoriesAnalytics,
    };
  }

  async _getAnalyticsByDates(userId, startDate, endDate) {
    try {
      const completions = await TaskCompletionModel.find({
        userId,
        completedAt: { $gte: startDate, $lte: endDate },
      });

      for (const competition of completions) {
        const task = await TaskModel.findById(competition.taskId);

        if (isFirstDateAfterSecond(new Date(), new Date(task.plannedDate))) {
          const newPlannedDate = planeNewRepeatDate(
            task.plannedDate,
            task.repeatDays
          );

          if (newPlannedDate !== task.plannedDate) {
            task.status = "active";
            task.plannedDate = newPlannedDate;
          }
          await task.save();
        }

        if (competition.status !== task.status) {
          competition.status = task.status;
          competition.completedAt = new Date();
          await competition.save();
        }
      }

      const { tasksAnalytics, priorityAnalytics, categoriesAnalytics } =
        await this._getAnalyticsByTasksCompletions(completions);

      return {
        tasksAnalytics,
        priorityAnalytics,
        categoriesAnalytics,
      };
    } catch (err) {
      console.log("err", err);
    }
  }

  async getAllAnalytics(userId) {
    const generalLists = await GeneralListsModel.findOne({ userId });

    if (!generalLists) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }

    const allTasks = generalLists.allTasksList.tasks;

    let tasks = [...allTasks];

    const allTasksList = await ListModel.find({ userId });

    for (const list of allTasksList) {
      tasks.push(...list.tasks);
    }

    const { tasksAnalytics, priorityAnalytics, categoriesAnalytics } =
      await this._getAnalyticsByTasks(tasks);

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

  async getComparisonAnalyticsByWeek(userId) {
    try {
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

      const [thisWeekAnalytics, lastWeekAnalytics] = await Promise.all([
        this._getAnalyticsByDates(userId, thisWeekStartDate, thisWeekEndDate),
        this._getAnalyticsByDates(userId, lastWeekStartDate, lastWeekEndDate),
      ]);

      const comparisonResult = {
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
      };

      return comparisonResult;
    } catch (err) {
      console.log("err", err);
    }
  }

  async getComparisonAnalyticsByMonth(userId) {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const thisMonthStartDate = new Date(currentYear, currentMonth, 1);
      const thisMonthEndDate = new Date(currentYear, currentMonth + 1, 0);

      const lastMonthStartDate = new Date(currentYear, currentMonth - 1, 1);
      const lastMonthEndDate = new Date(currentYear, currentMonth, 0);

      const [thisMonthAnalytics, lastMonthAnalytics] = await Promise.all([
        this._getAnalyticsByDates(userId, thisMonthStartDate, thisMonthEndDate),
        this._getAnalyticsByDates(userId, lastMonthStartDate, lastMonthEndDate),
      ]);

      const comparisonResult = {
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
      };

      return comparisonResult;
    } catch (err) {
      console.log("err", err);
    }
  }

  async getAnalyticsByYear(userId) {
    try {
        const currentDate = new Date();
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
        const endOfYear = new Date(currentDate.getFullYear() + 1, 0, 0);

        const completions = await TaskCompletionModel.find({
            userId,
            completedAt: { $gte: startOfYear, $lte: endOfYear }
        });

        const completionsByMonth = {};

        for (const completion of completions) {
            const month = completion.completedAt.getMonth();
            completionsByMonth[month] = completionsByMonth[month] || [];
            completionsByMonth[month].push(completion);
        }

        const analyticsByMonth = [];

        for (let i = 0; i < 12; i++) {
            const completionsForMonth = completionsByMonth[i] || [];
            const { tasksAnalytics, priorityAnalytics, categoriesAnalytics } =
                await this._getAnalyticsByTasksCompletions(completionsForMonth);

            analyticsByMonth.push({
                month: i, 
                tasksCount: completionsForMonth.length,
                tasksAnalytics,
                priorityAnalytics,
                categoriesAnalytics
            });
        }

        return analyticsByMonth;
    } catch (err) {
        console.log("Error fetching analytics by year:", err);
        throw err;
    }
}
}

module.exports = new AnalyticsService();
