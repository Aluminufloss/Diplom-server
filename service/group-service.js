const GroupModel = require("../models/Group");

const ApiError = require("../exceptions/api-error");

class GroupService {
  async createGroup(name, userId) {
    const candidate = await UserModel.findOne({ _id: userId });
    if (!candidate) {
      throw ApiError.BadRequest(
        `Пользователя по данному id не обнаружено`
      )
    }
    const group = await GroupModel.create({ name, userId });

    return group;
  }

  async deleteGroup(groupId) {
    const group = await GroupModel.findOne({ _id: groupId })
    if (!group) {
      throw ApiError.BadRequest("Неккоректный id группы")
    }
  
    await GroupModel.deleteOne({ _id: groupId })
    return
  }

  async updateGroupName(groupId, name) {
    const group = await GroupModel.findOne({ _id: groupId })
    if (!group) {
      throw ApiError.BadRequest("Неккоректный id группы")
    }
  
    await GroupModel.updateOne({ _id: groupId }, { name })
    return;
  }

  async addListToGroup(groupId, listId) {
    const group = await GroupModel.findOne({ _id: groupId })
    if (!group) {
      throw ApiError.BadRequest("Неккоректный id группы")
    }
  
    await GroupModel.updateOne({ _id: groupId }, { $push: { listId } })
    return;
  }

  async removeListFromGroup(groupId, listId) {
    const group = await GroupModel.findOne({ _id: groupId })
    if (!group) {
      throw ApiError.BadRequest("Неккоректный id группы")
    }
  
    await GroupModel.updateOne({ _id: groupId }, { $pull: { listId } })
    return;
  }
}

module.exports = new GroupService();