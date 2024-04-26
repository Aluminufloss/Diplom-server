const TaskModel = require("../models/Task");
const ListModel = require("../models/List");
const GeneralListsModel = require("../models/GeneralLists");

const { isDatesEqual, isFirstDateAfterSecond } = require("../utils/datesUtils");

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
    const listIds = !!listId ? [listId] : [];
    
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
      repeat,
      category,
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

  async updateTask(taskId, taskData) {
    const task = await TaskModel.findById(taskId);

    if (!task) {
      throw new ApiError.NotFound("Задача не была найдена");
    }

    Object.assign(task, taskData);

    await task.save();

    if (taskData.plannedDate) {
      const generalLists = await GeneralListsModel.findOne({
        userId: task.userId,
      });

      if (!generalLists) {
        throw ApiError.BadRequest("Неккоректный id пользователя");
      }

      const plannedList = generalLists.plannedList;
      const todayList = generalLists.todayList;

      if (!isDatesEqual(new Date(taskData.plannedDate), new Date())) {
        todayList.tasks = todayList.tasks.filter(
          (id) => id.toString() !== taskId
        );

        plannedList.tasks.push(taskId);

        plannedList.minPlannedDate =
          plannedList.minPlannedDate > task.plannedDate
            ? task.plannedDate
            : plannedList.minPlannedDate;
      } else {
        plannedList.tasks = plannedList.tasks.filter(
          (id) => id.toString() !== taskId
        );

        todayList.tasks.push(taskId);
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
    try {
      const generalLists = await GeneralListsModel.findOne({ userId });
      if (!generalLists) {
        throw ApiError.BadRequest("Неккоректный id пользователя");
      }
      const tasks = generalLists.todayList.tasks;

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
        return await Promise.all(tasks.map((taskId) => this.getTask(taskId)));
      }

      const tasksToDeleteFromPlanned = [];
      let newMinDate = null;

      for (const taskId of generalLists.plannedList.tasks) {
        const task = await this.getTask(taskId);

        if (isDatesEqual(new Date(task.plannedDate), new Date())) {
          tasks.push(task);
          tasksToDeleteFromPlanned.push(taskId);
        } else {
          newMinDate =
            newMinDate > task.plannedDate ? task.plannedDate : newMinDate;
        }
      }

      if (!!newMinDate) {
        generalLists.plannedList.minPlannedDate = newMinDate;
      }

      if (!tasksToDeleteFromPlanned.length) {
        return await Promise.all(tasks.map((taskId) => this.getTask(taskId)));
      }

      await GeneralListsModel.findOneAndUpdate(
        { userId },
        {
          $pull: {
            "plannedList.tasks": { $in: tasksToDeleteFromPlanned },
          },
        },
        { new: true }
      );

      return await Promise.all(tasks.map((taskId) => this.getTask(taskId)));
    } catch (err) {
      console.log("err", err);
    }
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

  async changeTaskStatus(taskId, status) {
    const task = await this.getTask(taskId);
    task.status = status;
    await task.save();
    return task;
  }
}

module.exports = new TaskService();
