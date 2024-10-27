import TaskModel from "../models/Task";
import ListModel from "../models/List";
import GeneralListsModel from "../models/GeneralLists";
import TaskCompletionModel from "../models/TaskCompletion";
import listService from "./list-service";
import filterTodayTasks from "../utils/filterTodayTasks";
import updateTaskCompletion from "../utils/updateTaskCompletion";
import { isDatesEqual, isFirstDateAfterSecond } from "../utils/datesUtils";
import planeNewRepeatDate from "../utils/planeNewRepeatDate";
import TaskDto from "../dtos/task-dto";
import ApiError from "../exceptions/api-error";
import { Document } from "mongoose";

interface ITaskData {
  title: string;
  description?: string;
  listId: string[];
  priority: string;
  plannedDate: Date;
  repeatDays: { day: number; isSelected: boolean }[];
  category: string;
  status: string;
  timeDuration?: number;
}

class TaskService {
  async createTask(taskData: ITaskData, userId: string): Promise<TaskDto> {
    const {
      title,
      description,
      listId,
      priority,
      plannedDate,
      repeatDays,
      category,
      status,
      timeDuration,
    } = taskData;

    const isRepeatedTask = repeatDays.some((day) => day.isSelected);

    if (listId.length) {
      const list = await listService.getList(listId);

      const task = await TaskModel.create({
        title,
        description,
        listId: [listId],
        priority,
        plannedDate,
        repeatDays,
        category,
        status,
        timeDuration,
      });

      list.tasks.push(task._id);

      const completion = await TaskCompletionModel.create({
        userId,
        taskId: task._id,
        statuses: ["active"],
        completedAt: [new Date().toISOString()],
        priorities: [task.priority],
        categories: [task.category],
        timeDurations: [task.timeDuration],
        isRepatedTask: isRepeatedTask,
      });

      await completion.save();
      await list.save();

      return new TaskDto(task);
    }

    const listIds: string[] = [];
    const generalLists = await GeneralListsModel.findOne({ userId });

    if (!generalLists) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }

    const plannedList = generalLists.plannedList;
    const todayList = generalLists.todayList;
    const allTasksList = generalLists.allTasksList;

    const isDateToday = isDatesEqual(new Date(plannedDate), new Date());

    if (isDateToday) {
      listIds.push(todayList._id);
    } else {
      listIds.push(plannedList._id);
    }

    listIds.push(allTasksList._id);

    const task = await TaskModel.create({
      title,
      description,
      listId: listIds,
      userId,
      priority,
      plannedDate,
      repeatDays,
      category,
      status,
      timeDuration,
    });

    if (!task) {
      throw ApiError.BadRequest("Ошибка при создании задачи");
    }

    if (isDateToday) {
      todayList.tasks.push(task._id);
    } else {
      plannedList.tasks.push(task._id);
      plannedList.minPlannedDate =
        plannedList.minPlannedDate > task.plannedDate
          ? task.plannedDate
          : plannedList.minPlannedDate;
    }

    allTasksList.tasks.push(task._id);
    await generalLists.save();

    const completion = await TaskCompletionModel.create({
      userId,
      taskId: task._id,
      statuses: ["active"],
      completedAt: [new Date().toISOString()],
      priorities: [task.priority],
      categories: [task.category],
      timeDurations: [task.timeDuration],
      isRepatedTask: isRepeatedTask,
    });

    await completion.save();
    return new TaskDto(task);
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await TaskModel.findOne({ _id: taskId });

    if (!task) {
      throw ApiError.BadRequest("Некорректный id задачи");
    }

    const completion = await TaskCompletionModel.findOne({
      userId,
      taskId,
    });

    if (
      completion.statuses[completion.statuses.length - 1] === "active" &&
      !completion.isRepatedTask
    ) {
      await completion.remove();
    }

    if (task.listId.length === 1) {
      await ListModel.updateOne(
        { _id: task.listId[0] },
        {
          $pull: {
            tasks: taskId,
          },
        },
      );

      await task.remove();
      return;
    }

    const generalLists = await GeneralListsModel.findOne({ userId });

    if (!generalLists) {
      throw ApiError.BadRequest("Некорректный id пользователя");
    }

    await GeneralListsModel.updateOne(
      { userId },
      {
        $pull: {
          "todayList.tasks": taskId,
          "plannedList.tasks": taskId,
          "allTasksList.tasks": taskId,
        },
      },
    );

    await generalLists.save();
    await task.remove();
  }

  async updateTask(
    taskData: ITaskData & { taskId: string },
    userId: string,
  ): Promise<TaskDto> {
    const task = await this.getTask(taskData.taskId);
    const generalLists = await GeneralListsModel.findOne({ userId });

    if (!generalLists) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }

    const todayList = generalLists.todayList;
    const plannedList = generalLists.plannedList;
    const allTasksList = generalLists.allTasksList;

    if (taskData.listId.length === 1 && task.listId.length === 2) {
      const list = await ListModel.findById(taskData.listId[0]);

      if (!list.tasks.includes(taskData.taskId)) {
        list.tasks.push(taskData.taskId);
        await list.save();
      }

      if (isDatesEqual(new Date(taskData.plannedDate), new Date())) {
        todayList.tasks = todayList.tasks.filter(
          (taskId) => taskId.toString() !== taskData.taskId,
        );
      } else {
        plannedList.tasks = plannedList.tasks.filter(
          (taskId) => taskId.toString() !== taskData.taskId,
        );
      }

      allTasksList.tasks = allTasksList.tasks.filter(
        (taskId) => taskId.toString() !== taskData.taskId,
      );
    } else if (taskData.listId.length === 0 && task.listId.length === 1) {
      const list = await ListModel.findById(task.listId[0]);
      list.tasks = list.tasks.filter(
        (taskId) => taskId.toString() !== taskData.taskId,
      );

      await list.save();

      if (isDatesEqual(new Date(taskData.plannedDate), new Date())) {
        todayList.tasks.push(taskData.taskId);
        taskData.listId.push(todayList._id);
      } else {
        plannedList.tasks.push(taskData.taskId);
        taskData.listId.push(plannedList._id);
      }

      allTasksList.tasks.push(taskData.taskId);
      taskData.listId.push(allTasksList._id);
    } else {
      const isDatesChanged = !isDatesEqual(
        new Date(taskData.plannedDate),
        new Date(task.plannedDate),
      );

      if (isDatesChanged && taskData.listId.length !== 1) {
        if (isDatesEqual(new Date(taskData.plannedDate), new Date())) {
          todayList.tasks.push(taskData.taskId);
          plannedList.tasks = plannedList.tasks.filter(
            (taskId) => taskId.toString() !== taskData.taskId,
          );
        } else {
          plannedList.tasks.push(taskData.taskId);
          todayList.tasks = todayList.tasks.filter(
            (taskId) => taskId.toString() !== taskData.taskId,
          );
        }
      }
    }

    const taksListIds = task.listId;

    if (taksListIds.length === 2 && taskData.listId.length !== 1) {
      taskData.listId = taksListIds;
    }

    Object.assign(task, taskData);

    const taskCompletion = await TaskCompletionModel.findOne({
      userId,
      taskId: task._id,
    });

    if (!taskCompletion) {
      throw ApiError.BadRequest("Неккоректный id задачи");
    }

    const isRepeatedTask = task.repeatDays.some((day) => day.isSelected);

    const updatedCompletion = updateTaskCompletion({
      status: task.status,
      taskCompletion,
      task,
      isRepeatedTask,
    });

    await updatedCompletion.save();
    await task.save();
    await generalLists.save();

    return new TaskDto(task);
  }

  async getTask(taskId: string): Promise<TaskModel> {
    const task = await TaskModel.findById(taskId);

    if (!task) {
      throw ApiError.BadRequest("Задача не была найдена");
    }

    return task;
  }

  async getTodayTasks(userId: string): Promise<TaskDto[]> {
    const generalLists = await GeneralListsModel.findOne({ userId });

    if (!generalLists) {
      throw ApiError.BadRequest("Некорректный id пользователя");
    }

    const todayList = generalLists.todayList;

    const tasks = await TaskModel.find({ _id: { $in: todayList.tasks } });

    return filterTodayTasks(tasks);
  }

  async getTasksByListId(userId: string, listId: string): Promise<TaskDto[]> {
    const generalLists = await GeneralListsModel.findOne({ userId });

    if (!generalLists) {
      throw ApiError.BadRequest("Некорректный id пользователя");
    }

    const listsIds: string[] =
      generalLists.plannedList._id.toString() === listId
        ? generalLists.plannedList.tasks
        : generalLists.todayList._id.toString() === listId
          ? generalLists.todayList.tasks
          : generalLists.allTasksList.tasks;

    const tasks = await TaskModel.find({ _id: { $in: listsIds } });

    return tasks.map((task) => new TaskDto(task));
  }

  async completeTask(taskId: string, userId: string): Promise<void> {
    const taskCompletion = await TaskCompletionModel.findOne({
      taskId,
      userId,
    });

    if (!taskCompletion) {
      throw ApiError.BadRequest("Некорректный id задачи");
    }

    if (
      taskCompletion.statuses[taskCompletion.statuses.length - 1] ===
      "completed"
    ) {
      throw ApiError.BadRequest("Задача уже выполнена");
    }

    taskCompletion.statuses.push("completed");
    taskCompletion.completedAt.push(new Date().toISOString());
    await taskCompletion.save();
  }

  async updateRepeatTask(
    taskId: string,
    userId: string,
  ): Promise<TaskDto | null> {
    const task = await TaskModel.findById(taskId);

    if (!task) {
      throw ApiError.BadRequest("Некорректный id задачи");
    }

    const newPlannedDate = planeNewRepeatDate(task);
    task.plannedDate = newPlannedDate;

    await task.save();

    const completion = await TaskCompletionModel.findOne({ userId, taskId });

    if (!completion) {
      throw ApiError.BadRequest("Некорректный id задачи");
    }

    const newCompletion = await TaskCompletionModel.create({
      userId,
      taskId: task._id,
      statuses: ["active"],
      completedAt: [],
      priorities: [task.priority],
      categories: [task.category],
      timeDurations: [task.timeDuration],
      isRepatedTask: true,
    });

    await newCompletion.save();
    return new TaskDto(task);
  }

  async changeTaskStatus(
    taskId: string,
    userId: string,
    status: string,
  ): Promise<TaskDto> {
    const task = await TaskModel.findById(taskId);

    if (!task) {
      throw ApiError.BadRequest("Некорректный id задачи");
    }

    task.status = status;

    await task.save();

    const taskCompletion = await TaskCompletionModel.findOne({
      userId,
      taskId,
    });

    if (!taskCompletion) {
      throw ApiError.BadRequest("Некорректный id задачи");
    }

    taskCompletion.statuses.push(status);
    await taskCompletion.save();

    return new TaskDto(task);
  }
}

export default new TaskService();
