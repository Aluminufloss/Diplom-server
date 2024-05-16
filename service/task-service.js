const TaskModel = require("../models/Task");
const ListModel = require("../models/List");
const GeneralListsModel = require("../models/GeneralLists");

const listService = require("./list-service");

const filterTodayTasks = require("../utils/filterTodayTasks");
const { isDatesEqual, isFirstDateAfterSecond } = require("../utils/datesUtils");
const planeNewRepeatDate = require("../utils/planeNewRepeatDate");

const TaskDto = require("../dtos/task-dto");

const ApiError = require("../exceptions/api-error");

class TaskService {
  async createTask(taskData, userId) {
    const {
      title,
      description,
      listId,
      priority,
      plannedDate,
      repeatDays,
      category,
      status,
    } = taskData;

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
      });

      list.tasks.push(task._id);

      await list.save();

      return new TaskDto(task);
    }

    const listIds = [];

    const generalLists = await GeneralListsModel.findOne({ userId });
    const plannedList = generalLists.plannedList;
    const todayList = generalLists.todayList;
    const allTasksList = generalLists.allTasksList;

    if (!generalLists) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }

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

    return new TaskDto(task);
  }

  async deleteTask(taskId, userId) {
    const task = await TaskModel.findOne({ _id: taskId });

    if (!task) {
      throw ApiError.BadRequest("Некорректный id задачи");
    }

    if (task.listId.length === 1) {
      await ListModel.updateOne(
        { _id: task.listId },
        {
          $pull: {
            tasks: taskId,
          },
        }
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
      }
    );

    await generalLists.save();
    await task.remove();
  }

  async updateTask(taskData, userId) {
    const task = await TaskModel.findById(taskData.taskId);

    if (!task) {
      throw new ApiError.NotFound("Задача не была найдена");
    }

    Object.assign(task, taskData);

    await task.save();

    if (task.listId.length) {
      return new TaskDto(task);
    }

    const generalLists = await GeneralListsModel.findOne({
      userId,
    });

    if (!generalLists) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }

    const plannedList = generalLists.plannedList;
    const todayList = generalLists.todayList;

    if (!isDatesEqual(new Date(taskData.plannedDate), new Date())) {
      todayList.tasks = todayList.tasks.filter(
        (id) => id.toString() !== taskData.taskId
      );

      plannedList.tasks.push(taskData.taskId);

      plannedList.minPlannedDate =
        plannedList.minPlannedDate > task.plannedDate
          ? task.plannedDate
          : plannedList.minPlannedDate;
    } else {
      plannedList.tasks = plannedList.tasks.filter(
        (id) => id.toString() !== taskData.taskId
      );

      todayList.tasks.push(taskData.taskId);
    }

    await generalLists.save();

    return new TaskDto(task);
  }

  async getTask(taskId) {
    const task = await TaskModel.findById(taskId);

    if (!task) {
      throw ApiError.BadRequest("Задача не была найдена");
    }

    return task;
  }

  async getTodayTasks(userId) {
    const generalLists = await GeneralListsModel.findOne({ userId });

    if (!generalLists) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }

    const tasks = generalLists.todayList.tasks;

    const todayTasks = await Promise.all(
      tasks.map((taskId) => this.getTask(taskId))
    );

    const { filteredTodayTasks, tasksToDeleteFromToday } =
      filterTodayTasks(todayTasks);

    if (
      isFirstDateAfterSecond(
        new Date(generalLists.plannedList.minPlannedDate),
        new Date()
      ) ||
      isDatesEqual(
        new Date(generalLists.plannedList.minPlannedDate),
        new Date()
      )
    ) {
      await GeneralListsModel.findOneAndUpdate(
        { userId },
        {
          $pull: {
            "todayList.tasks": { $in: tasksToDeleteFromToday },
          },
          $push: {
            "plannedList.tasks": { $each: tasksToDeleteFromToday },
          },
        },
        { new: true }
      );

      return filteredTodayTasks.map((task) => new TaskDto(task));
    }

    const tasksToDeleteFromPlanned = [];
    let newMinDate = null;

    for (const taskId of generalLists.plannedList.tasks) {
      const task = await this.getTask(taskId);

      if (isDatesEqual(new Date(task.plannedDate), new Date())) {
        filteredTodayTasks.push(task);
        tasksToDeleteFromPlanned.push(taskId);
      } else {
        newMinDate =
          newMinDate > task.plannedDate ? task.plannedDate : newMinDate;
      }
    }

    if (!!newMinDate) {
      generalLists.plannedList.minPlannedDate = newMinDate;
    }

    await GeneralListsModel.findOneAndUpdate(
      { userId },
      {
        $pull: {
          "todayList.tasks": { $in: tasksToDeleteFromToday },
          "plannedList.tasks": { $in: tasksToDeleteFromToday },
        },
      },
      { new: true }
    );

    await GeneralListsModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          "plannedList.tasks": { $each: tasksToDeleteFromToday },
        },
      },
      { new: true }
    );
    return filteredTodayTasks.map((task) => new TaskDto(task));
  }

  async getPlannedTasks(userId) {
    const generalLists = await GeneralListsModel.findOne({ userId });

    if (!generalLists) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }

    const plannedTasks = generalLists.plannedList.tasks;

    let newMinPlannedDate = new Date().toISOString();
    const tasksToDeleteFromPlanned = [];
    const resultTasks = [];

    for (const taskId of plannedTasks) {
      const task = await this.getTask(taskId);

      const isTwoDatesEqual = isDatesEqual(
        new Date(task.plannedDate),
        new Date()
      );

      if (isTwoDatesEqual) {
        tasksToDeleteFromPlanned.push(taskId);
      } else {
        if (isFirstDateAfterSecond(new Date(), new Date(task.plannedDate))) {
          const newPlannedDate = planeNewRepeatDate(
            task.plannedDate,
            task.repeatDays
          );

          if (newPlannedDate !== task.plannedDate) {
            task.status = "active";
            task.plannedDate = newPlannedDate;

            if (newPlannedDate < generalLists.plannedList.minPlannedDate) {
              newMinPlannedDate = newPlannedDate;
            }
          } else {
            task.status = "expired";
          }
        }

        await task.save();

        generalLists.plannedList.minPlannedDate = newMinPlannedDate;

        await generalLists.save();

        resultTasks.push(task);
      }
    }

    if (!!tasksToDeleteFromPlanned.length) {
      await GeneralListsModel.findOneAndUpdate(
        { userId },
        {
          $pull: {
            "plannedList.tasks": { $in: tasksToDeleteFromPlanned },
          },
          $push: {
            "todayList.tasks": { $each: tasksToDeleteFromPlanned },
          },
        },
        { new: true }
      );

      await generalLists.save();
    }

    return resultTasks.map((task) => new TaskDto(task));
  }

  async getAllTasks(userId) {
    const generalLists = await GeneralListsModel.findOne({ userId });

    if (!generalLists) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }

    const tasks = [];

    for (const taskId of generalLists.allTasksList.tasks) {
      const task = await this.getTask(taskId);

      if (
        isFirstDateAfterSecond(new Date(), new Date(task.plannedDate)) &&
        task.status !== "completed"
      ) {
        const newPlannedDate = planeNewRepeatDate(
          task.plannedDate,
          task.repeatDays
        );

        if (newPlannedDate === task.plannedDate) {
          task.status = "expired";
        } else {
          task.plannedDate = newPlannedDate;
        }

        await task.save();
      }

      tasks.push(new TaskDto(task));
    }

    return tasks;
  }

  async changeTaskStatus(taskId, status) {
    const task = await this.getTask(taskId);

    if (task.status === "expired") {
      const newPlannedDate = new Date().toISOString();

      const updatedTask = await TaskModel.findOneAndUpdate(
        { _id: taskId },
        { $set: { status, plannedDate: newPlannedDate } },
        { new: true }
      );

      return new TaskDto(updatedTask);
    }

    const updatedTask = await TaskModel.findOneAndUpdate(
      { _id: taskId },
      { $set: { status } },
      { new: true }
    );

    return new TaskDto(updatedTask);
  }
}

module.exports = new TaskService();
