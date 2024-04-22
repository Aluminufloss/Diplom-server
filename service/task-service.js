const TaskModel = require("../models/Task");
const ListModel = require("../models/List");
const GeneralListsModel = require("../models/GeneralLists");

const { checkIsDateToday } = require("../utils/checkIsDateToday");

const ApiError = require("../exceptions/api-error");

class TaskService {
  async createTask({
    title,
    description,
    listId,
    userId,
    priority,
    plannedDate = new Date(),
    repeat,
    category,
  }) {
    const listIds = [];

    if (!!listId) {
      listIds.push(listId);
    }

    const generalLists = await GeneralListsModel.findOne({ userId });

    if (!generalLists) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }

    const isDateToday = checkIsDateToday(plannedDate, new Date());

    if (isDateToday) {
      listIds.push(generalLists.todayList._id);
    } else {
      listIds.push(generalLists.plannedList._id);
    }

    listIds.push(generalLists.allTasksList._id);

    const task = await TaskModel.create({
      title,
      description,
      listId: listIds,
      userId,
      priority,
      plannedDate,
      repeat,
      category,
    });

    if (!task) {
      throw ApiError.BadRequest("Ошибка при создании задачи");
    }

    if (isDateToday) {
      generalLists.todayList.tasks.push(task._id);
    } else {
      generalLists.plannedList.tasks.push(task._id);
    }

    generalLists.allTasksList.tasks.push(task._id);

    console.log("genereal", generalLists);

    if (!!listId) {
      const list = await ListModel.findOne({ _id: listId });
      list.tasks.push(task._id);

      await list.save();
    }

    await generalLists.save();
    return task;
  }

  async deleteTask(taskId, userId) {
    const task = await TaskModel.findOne({ _id: taskId });

    if (!task) {
      throw ApiError.BadRequest("Неккоректный id задачи");
    }

    const generalLists = await GeneralListsModel.findOne({ userId });

    if (!generalLists) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }

    const listsToUpdate = [
      ...task.listId,
      generalLists.todayList._id,
      generalLists.plannedList._id,
      generalLists.allTasksList._id,
    ];

    await ListModel.updateMany(
      { _id: { $in: listsToUpdate } },
      { $pull: { tasks: taskId } }
    );

    await GeneralListsModel.findOneAndUpdate(
      { userId },
      {
        $pull: {
          "todayList.tasks": taskId,
          "plannedList.tasks": taskId,
          "allTasksList.tasks": taskId,
        },
      },
      { new: true }
    );

    await task.remove();
  }

  async updateTask(taskId, updatedTaskData) {
    const task = await TaskModel.findById(taskId);

    if (!task) {
      throw new ApiError.NotFound("Задача не была найдена");
    }

    Object.assign(task, updatedTaskData);

    await task.save();

    if (updatedTaskData.plannedDate) {
      const generalLists = await GeneralListsModel.findOne({
        userId: task.userId,
      });
      if (!generalLists) {
        throw ApiError.BadRequest("Неккоректный id пользователя");
      }

      if (!checkIsDateToday(updatedTaskData.plannedDate, new Date())) {
        generalLists.todayList.tasks = generalLists.todayList.tasks.filter(
          (id) => id.toString() !== taskId
        );

        generalLists.plannedList.tasks.push(taskId);
      } else {
        generalLists.plannedList.tasks = generalLists.plannedList.tasks.filter(
          (id) => id.toString() !== taskId
        );

        generalLists.todayList.tasks.push(taskId);
      }

      await generalLists.save();
    }

    return task;
  }

  async getTask(taskId) {
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new ApiError.NotFound("Задача не была найдена");
    }
    return task;
  }

  async getTodayTasks(userId) {
    const generalLists = await GeneralListsModel.findOne({ userId });
    if (!generalLists) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }
    const tasks = generalLists.todayList.tasks;
    return tasks;
  }

  async getPlannedTasks(userId) {
    const generalLists = await GeneralListsModel.findOne({ userId });
    if (!generalLists) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }
    const tasks = generalLists.plannedList.tasks;
    return tasks;
  }

  async getAllTasks(userId) {
    const generalLists = await GeneralListsModel.findOne({ userId });
    if (!generalLists) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }
    const tasks = generalLists.allTasksList.tasks;
    return tasks;
  }
}

module.exports = new TaskService();
