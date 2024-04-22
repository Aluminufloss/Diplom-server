const ListModel = require("../models/List");
const UserModel = require("../models/User");
const GeneralListsModel = require ("../models/GeneralLists");

class ListService {
  async createList(name, userId) {
    const candidate = await UserModel.findOne({ _id: userId });

    if (!candidate) {
      throw ApiError.BadRequest(
        `Пользователя по данному id не обнаружено`
      );
    }

    const list = await ListModel.create({ name, userId });
    return list;
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
}

module.exports = new ListService();