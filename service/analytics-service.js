const GeneralListsModel = require("../models/GeneralLists");

const TaskService = require("../service/task-service");
const ListService = require("../service/list-service");

const TaskModel = require("../models/Task");
const ListModel = require("../models/List");
const TaskCompletionModel = require("../models/TaskCompletion");

const updateTaskCompletion = require("../utils/updateTaskCompletion");
const parseMinutesToHours = require("../utils/parseMinutesToHours");
const { isFirstDateAfterSecond } = require("../utils/datesUtils");

const ApiError = require("../exceptions/api-error");

class AnalyticsService {
  async _getAnalyticsByTasks(tasks) {
    const priorityAnalytics = {
      low: 0,
      medium: 0,
      high: 0,
    };

    const tasksAnalytics = {
      completed: 0,
      expired: 0,
      active: 0,
      tasksLength: 0,
    };

    const categoriesAnalytics = {
      Personal: {
        numberOfTasks: 0,
        totalTime: {
          hours: 0,
          minutes: 0,
        },
      },
      Work: {
        numberOfTasks: 0,
        totalTime: {
          hours: 0,
          minutes: 0,
        },
      },
      Study: {
        numberOfTasks: 0,
        totalTime: {
          hours: 0,
          minutes: 0,
        },
      },
      Home: {
        numberOfTasks: 0,
        totalTime: {
          hours: 0,
          minutes: 0,
        },
      },
      Travelling: {
        numberOfTasks: 0,
        totalTime: {
          hours: 0,
          minutes: 0,
        },
      },
      Without: {
        numberOfTasks: 0,
        totalTime: {
          hours: 0,
          minutes: 0,
        },
      },
    };

    for (const task of tasks) {
      tasksAnalytics[task.status] += 1;
      priorityAnalytics[task.priority] += 1;
      categoriesAnalytics[task.category].numberOfTasks += 1;
      categoriesAnalytics[task.category].totalTime.hours +=
        task.timeDuration.hours;
      categoriesAnalytics[task.category].totalTime.minutes +=
        task.timeDuration.minutes;
    }

    tasksAnalytics.tasksLength = tasks.length;

    for (const category in categoriesAnalytics) {
      if (categoriesAnalytics[category].totalTime.minutes >= 60) {
        const parsedTime = parseMinutesToHours(
          categoriesAnalytics[category].totalTime
        );
        categoriesAnalytics[category].totalTime = parsedTime;
      }
    }

    return {
      priorityAnalytics,
      tasksAnalytics,
      categoriesAnalytics,
    };
  }

  async _getAnalyticsByTasksCompletions({ completions, startDate, endDate }) {
    const priorityAnalytics = {
      low: 0,
      medium: 0,
      high: 0,
    };

    const tasksAnalytics = {
      completed: 0,
      expired: 0,
      active: 0,
      tasksLength: 0,
    };

    const categoriesAnalytics = {
      Personal: {
        numberOfTasks: 0,
        totalTime: {
          hours: 0,
          minutes: 0,
        },
      },
      Work: {
        numberOfTasks: 0,
        totalTime: {
          hours: 0,
          minutes: 0,
        },
      },
      Study: {
        numberOfTasks: 0,
        totalTime: {
          hours: 0,
          minutes: 0,
        },
      },
      Home: {
        numberOfTasks: 0,
        totalTime: {
          hours: 0,
          minutes: 0,
        },
      },
      Travelling: {
        numberOfTasks: 0,
        totalTime: {
          hours: 0,
          minutes: 0,
        },
      },
      Without: {
        numberOfTasks: 0,
        totalTime: {
          hours: 0,
          minutes: 0,
        },
      },
    };

    for (const completion of completions) {
      for (let i = 0; i < completion.statuses.length; i++) {
        if (
          isFirstDateAfterSecond(
            new Date(completion.completedAt[i]),
            startDate
          ) &&
          isFirstDateAfterSecond(endDate, new Date(completion.completedAt[i]))
        ) {
          tasksAnalytics[completion.statuses[i]] += 1;
          priorityAnalytics[completion.priorities[i]] += 1;
          categoriesAnalytics[completion.categories[i]].numberOfTasks += 1;
          categoriesAnalytics[completion.categories[i]].totalTime.hours +=
            completion.timeDurations[i].hours;
          categoriesAnalytics[completion.categories[i]].totalTime.minutes +=
            completion.timeDurations[i].minutes;

          tasksAnalytics.tasksLength++;
        } else {
          continue;
        }
      }
    }

    return {
      priorityAnalytics,
      tasksAnalytics,
      categoriesAnalytics,
    };
  }

  async _getAnalyticsByDates(userId, startDate, endDate) {
    try {
      const completions = await TaskCompletionModel.find({ userId });

      const actualCompletions = [];
      const updatedCompletions = [];

      for (const completion of completions) {
        const task = await TaskModel.findById(completion.taskId);

        if (!task) {
          actualCompletions.push(completion);
        } else {
          const updatedCompletion = updateTaskCompletion({
            status: task.status,
            taskCompletion: completion,
            task,
          });

          actualCompletions.push(updatedCompletion);
          updatedCompletions.push(updatedCompletion);
        }
      }

      for (const updatedCompletion of updatedCompletions) {
        await TaskCompletionModel.updateOne(
          { _id: updatedCompletion._id },
          updatedCompletion
        );
      }

      const { tasksAnalytics, priorityAnalytics, categoriesAnalytics } =
        await this._getAnalyticsByTasksCompletions({
          completions: actualCompletions,
          startDate,
          endDate,
        });

      return {
        tasksAnalytics,
        priorityAnalytics,
        categoriesAnalytics,
      };
    } catch (err) {
      console.error("Error fetching analytics by dates:", err);
      throw err;
    }
  }

  async getAllAnalytics(userId) {
    const generalLists = await GeneralListsModel.findOne({ userId });

    if (!generalLists) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }

    const allTasks = await TaskService.getAllTasks(userId);

    let tasks = [...allTasks];

    const allTasksList = await ListModel.find({ userId });

    for (const list of allTasksList) {
      for (const taskId of list.tasks) {
        const task = await TaskService.getTask(taskId);
        tasks.push(task);
      }
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
        completedAt: { $gte: startOfYear, $lte: endOfYear },
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
          categoriesAnalytics,
        });
      }

      return analyticsByMonth;
    } catch (err) {
      console.log("Error fetching analytics by year:", err);
    }
  }
}

module.exports = new AnalyticsService();
