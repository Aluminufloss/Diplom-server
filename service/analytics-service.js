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
const parseMinutesToHours = require("../utils/parseMinutesToHours");

class AnalyticsService {
  async _getAnalyticsByTasks(tasks) {
    try {
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
        categoriesAnalytics[task.category].totalTime.hours += task.timeDuration.hours;
        categoriesAnalytics[task.category].totalTime.minutes +=
          task.timeDuration.minutes;
      }
  
      tasksAnalytics.tasksLength = tasks.length;

      for (const category in categoriesAnalytics) {
        if (categoriesAnalytics[category].totalTime.minutes >= 60) {
          const parsedTime = parseMinutesToHours(categoriesAnalytics[category].totalTime);
          categoriesAnalytics[category].totalTime = parsedTime;
        }
      }
  
      return {
        priorityAnalytics,
        tasksAnalytics,
        categoriesAnalytics,
      };
    } catch (err) {
      console.log("err", err)
    }
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

      const actualCompletions = [];

      for (const competition of completions) {
        const task = await TaskModel.findById(competition.taskId);

        if (!task) {
          if (competition.status === "active") {
            await competition.remove();
          } else {
            actualCompletions.push(competition);
          }

          continue;
        }

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

        actualCompletions.push(competition);
      }

      const { tasksAnalytics, priorityAnalytics, categoriesAnalytics } =
        await this._getAnalyticsByTasksCompletions(actualCompletions);

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

    const allTasks = await TaskService.getAllTasks(userId);

    let tasks = [...allTasks];

    const allTasksList = await ListModel.find({ userId });

    for (const list of allTasksList) {
      tasks.push(...list.tasks);
    }

    const { tasksAnalytics, priorityAnalytics, categoriesAnalytics } =
      await this._getAnalyticsByTasks(tasks);

    console.log("tasksAnalytics", tasksAnalytics);
    console.log("priorityAnalytics", priorityAnalytics);
    console.log("categoriesAnalytics", categoriesAnalytics);
    console.log()

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

      console.log("thisWeekAnalytics", thisWeekAnalytics);

      console.log("lastWeekAnalytics", lastWeekAnalytics);

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
