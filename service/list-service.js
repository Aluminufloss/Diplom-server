const ListModel = require("../models/List");
const UserModel = require("../models/User");
const TaskModel = require("../models/Task");
const GroupModel = require("../models/Group");
const GeneralListsModel = require("../models/GeneralLists");

const makeGroupsFromLists = require("../utils/makeGroupsFromLists");
const { isFirstDateAfterSecond, isDatesEqual } = require("../utils/datesUtils");

const ListDto = require("../dtos/list-dto");
const TaskDto = require("../dtos/task-dto");

const ApiError = require("../exceptions/api-error");

class ListService {
  async createList(name, userId, groupId) {
    const candidate = await UserModel.findOne({ _id: userId });

    if (!candidate) {
      throw ApiError.BadRequest(`Пользователя по данному id не обнаружено`);
    }

    const list = await ListModel.findOne({ name, userId });

    if (list) {
      throw ApiError.BadRequest("Список с таким названием уже существует");
    }

    const newList = await ListModel.create({ name, userId, groupId });

    if (groupId) {
      const group = await GroupModel.findOne({ _id: groupId });

      group.lists.push(newList._id);
      await group.save();
    }

    return new ListDto(newList);
  }

  async getTasksByListId(listId) {
    const list = await ListModel.findOne({ _id: listId });

    const resultTasks = [];

    for (const taskId of list.tasks) {
      const task = await TaskModel.findOne({ _id: taskId });

      if (
        isFirstDateAfterSecond(new Date(), new Date(task.plannedDate)) &&
        task.status !== "completed"
      ) {
        const newPlannedDate = planeNewRepeatDate(
          task.plannedDate,
          task.repeatDays
        );

        if (
          isDatesEqual(new Date(newPlannedDate), new Date(task.plannedDate))
        ) {
          task.status = "expired";
        } else {
          task.plannedDate = newPlannedDate;
        }

        await task.save();
      }

      resultTasks.push(new TaskDto(task));
    }

    return resultTasks;
  }

  async createGeneralLists(userId) {
    const generalLists = await GeneralListsModel.create({
      userId,
      todayList: { tasks: [] },
      plannedList: { tasks: [] },
      allTasksList: { tasks: [] },
    });
    return generalLists;
  }

  async deleteList(listId, userId) {
    const list = await ListModel.findOne({ _id: listId });

    if (!list) {
      throw ApiError.BadRequest("Неккоректный id списка");
    }

    if (list.userId.toString() !== userId) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }

    await ListModel.deleteOne({ _id: listId });
    return;
  }

  async getList(listId) {
    const list = await ListModel.findOne({ _id: listId });
    return list;
  }

  async getLists(userId) {
    const listsFromDB = await ListModel.find({ userId: userId });

    const listsWithTasks = [];

    for (const list of listsFromDB) {
      const tasks = await this.getTasksByListId(list._id);

      const listObject = {
        listId: list._id,
        title: list.name,
        groupId: list.groupId,
        tasks,
      };

      listsWithTasks.push(listObject);
    }

    const userGroups = await GroupModel.find({ userId });

    const { lists, groups } = await makeGroupsFromLists(
      listsWithTasks,
      userGroups
    );

    return { lists, groups };
  }

  async getListName(listId) {
    const list = await ListModel.findOne({ _id: listId });
    return list.name;
  }

  async getAllListsNames(listsId) {
    const listsNames = [];

    for (const listId of listsId) {
      const listName = await this.getListName(listId);
      listsNames.push(listName);
    }

    return listsNames;
  }
}

module.exports = new ListService();
