import GeneralListsModel from "../models/GeneralLists";
import TaskService from "../service/task-service";
import ListService from "../service/list-service";
import TaskModel from "../models/Task";
import ListModel from "../models/List";
import TaskCompletionModel from "../models/TaskCompletion";
import updateTaskCompletion from "../utils/updateTaskCompletion";
import parseMinutesToHours from "../utils/parseMinutesToHours";
import { isFirstDateAfterSecond } from "../utils/datesUtils";
import ApiError from "../exceptions/api-error";

interface TimeDuration {
  hours: number;
  minutes: number;
}

interface CategoryAnalytics {
  numberOfTasks: number;
  totalTime: TimeDuration;
}

interface TaskAnalytics {
  completed: number;
  expired: number;
  active: number;
  tasksLength: number;
}

interface PriorityAnalytics {
  low: number;
  medium: number;
  high: number;
}

interface AnalyticsResult {
  priorityAnalytics: PriorityAnalytics;
  tasksAnalytics: TaskAnalytics;
  categoriesAnalytics: Record<string, CategoryAnalytics>;
}

interface Completion {
  statuses: string[];
  priorities: string[];
  categories: string[];
  timeDurations: TimeDuration[];
  completedAt: Date[];
}

class AnalyticsService {
  private categoriesAnalyticsTemplate: Record<string, CategoryAnalytics>;

  constructor() {
    this.categoriesAnalyticsTemplate = {
      Personal: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
      Work: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
      Study: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
      Home: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
      Travelling: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
      Without: { numberOfTasks: 0, totalTime: { hours: 0, minutes: 0 } },
    };
  }

  private _getAnalyticsByTasks(tasks: any[]): AnalyticsResult {
    const priorityAnalytics: PriorityAnalytics = { low: 0, medium: 0, high: 0 };
    const tasksAnalytics: TaskAnalytics = { completed: 0, expired: 0, active: 0, tasksLength: 0 };
    const categoriesAnalytics: Record<string, CategoryAnalytics> = JSON.parse(JSON.stringify(this.categoriesAnalyticsTemplate));

    tasks.forEach((task) => {
      tasksAnalytics[task.status] += 1;
      priorityAnalytics[task.priority] += 1;
      categoriesAnalytics[task.category].numberOfTasks += 1;
      categoriesAnalytics[task.category].totalTime.hours += task.timeDuration.hours;
      categoriesAnalytics[task.category].totalTime.minutes += task.timeDuration.minutes;
    });

    tasksAnalytics.tasksLength = tasks.length;

    // Convert totalTime to proper hours and minutes
    Object.keys(categoriesAnalytics).forEach((category) => {
      if (categoriesAnalytics[category].totalTime.minutes >= 60) {
        categoriesAnalytics[category].totalTime = parseMinutesToHours(categoriesAnalytics[category].totalTime);
      }
    });

    return { priorityAnalytics, tasksAnalytics, categoriesAnalytics };
  }

  private async _getAnalyticsByTasksCompletions({
    completions,
    startDate,
    endDate,
  }: {
    completions: Completion[];
    startDate: Date;
    endDate: Date;
  }): Promise<AnalyticsResult> {
    const priorityAnalytics: PriorityAnalytics = { low: 0, medium: 0, high: 0 };
    const tasksAnalytics: TaskAnalytics = { completed: 0, expired: 0, active: 0, tasksLength: 0 };
    const categoriesAnalytics: Record<string, CategoryAnalytics> = JSON.parse(JSON.stringify(this.categoriesAnalyticsTemplate));

    for (const completion of completions) {
      for (let i = 0; i < completion.statuses.length; i++) {
        const completionDate = new Date(completion.completedAt[i]);
        if (
          isFirstDateAfterSecond(completionDate, startDate) &&
          isFirstDateAfterSecond(endDate, completionDate)
        ) {
          tasksAnalytics[completion.statuses[i]] += 1;
          priorityAnalytics[completion.priorities[i]] += 1;
          categoriesAnalytics[completion.categories[i]].numberOfTasks += 1;
          categoriesAnalytics[completion.categories[i]].totalTime.hours += completion.timeDurations[i].hours;
          categoriesAnalytics[completion.categories[i]].totalTime.minutes += completion.timeDurations[i].minutes;

          tasksAnalytics.tasksLength++;
        }
      }
    }

    return { priorityAnalytics, tasksAnalytics, categoriesAnalytics };
  }

  private async _getAnalyticsByDates(userId: string, startDate: Date, endDate: Date): Promise<AnalyticsResult> {
    try {
      const completions = await TaskCompletionModel.find({ userId });

      const actualCompletions: Completion[] = [];
      const updatedCompletions: Completion[] = [];

      for (const completion of completions) {
        const task = await TaskModel.findById(completion.taskId);

        if (!task) {
          actualCompletions.push(completion);
        } else {
          const updatedCompletion = updateTaskCompletion({ status: task.status, taskCompletion: completion, task });
          actualCompletions.push(updatedCompletion);
          updatedCompletions.push(updatedCompletion);
        }
      }

      for (const updatedCompletion of updatedCompletions) {
        await TaskCompletionModel.updateOne({ _id: updatedCompletion._id }, updatedCompletion);
      }

      return await this._getAnalyticsByTasksCompletions({ completions: actualCompletions, startDate, endDate });
    } catch (err) {
      console.error("Error fetching analytics by dates:", err);
      throw err;
    }
  }

  async getAllAnalytics(userId: string): Promise<AnalyticsResult> {
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
        if (task) tasks.push(task); // Ensure that we only push valid tasks
      }
    }

    return this._getAnalyticsByTasks(tasks);
  }

  async getAnalyticsByList(listId: string): Promise<AnalyticsResult> {
    const list = await ListService.getList(listId);

    if (!list) {
      throw ApiError.BadRequest("Неккоректный id списка");
    }

    const tasks = list.tasks; // Assuming tasks are stored directly as IDs

    return this._getAnalyticsByTasks(tasks);
  }

  async getComparisonAnalyticsByWeek(userId: string): Promise<any> {
    try {
      const currentDate = new Date();
      const currentDay = currentDate.getDay();

      const thisWeekStartDate = new Date(currentDate);
      thisWeekStartDate.setDate(currentDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1));
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

      return {
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
    } catch (err) {
      console.error("Error comparing analytics by week:", err);
      throw err;
    }
  }

  async getComparisonAnalyticsByMonth(userId: string): Promise<any> {
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

      return {
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
    } catch (err) {
      console.error("Error comparing analytics by month:", err);
      throw err;
    }
  }
}

export default new AnalyticsService();
