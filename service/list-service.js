const ListModel = require("../models/List");
const UserModel = require("../models/User");
const GeneralListsModel = require("../models/GeneralLists");

const ListDto = require("../dtos/list-dto");
const TaskDto = require("../dtos/task-dto");

const ApiError = require("../exceptions/api-error");

class ListService {
  async createList(name, userId) {
    const candidate = await UserModel.findOne({ _id: userId });

    if (!candidate) {
      throw ApiError.BadRequest(`Пользователя по данному id не обнаружено`);
    }

    const list = await ListModel.findOne({ name, userId });

    if (list) {
      throw ApiError.BadRequest("Список с таким названием уже существует");
    }

    const newList = await ListModel.create({ name, userId });
    return new ListDto(newList);
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
    const lists = await ListModel.find({ userId: userId });
    return lists.map((list) => new ListDto(list));
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

  async getTasksByListId(listId) {
    const list = await ListModel.findOne({ _id: listId });

    const resultTasks = [];

    for (const taskId of list.tasks) {
      const task = await TaskModel.findOne({ _id: taskId });

      if (isFirstDateAfterSecond(new Date(), new Date(task.plannedDate))) {
        const hasRepeatDays = task.repeatDays.some((day) => day.isSelected);

        if (hasRepeatDays) {
          task.plannedDate = planeNewRepeatDate(
            task.plannedDate,
            task.repeatDays
          );
        } else {
          task.status = "expired";
        }

        await task.save();

        resultTasks.push(new TaskDto(task));
      }
    }

    return resultTasks;
  }
}

module.exports = new ListService();
