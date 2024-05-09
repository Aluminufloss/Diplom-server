const GroupModel = require("../models/Group");
const UserModel = require("../models/User");

const ApiError = require("../exceptions/api-error");

const GroupDto = require("../dtos/group-dto");

class GroupService {
  async createGroup(name, userId) {
    const candidate = await UserModel.findOne({ _id: userId });
    if (!candidate) {
      throw ApiError.BadRequest(`Пользователя по данному id не обнаружено`);
    }
    const group = await GroupModel.create({ name, userId });

    return new GroupDto(group);
  }

  async deleteGroup(groupId) {
    const group = await GroupModel.findOne({ _id: groupId });
    if (!group) {
      throw ApiError.BadRequest("Неккоректный id группы");
    }

    await GroupModel.deleteOne({ _id: groupId });
    return;
  }

  async updateGroupName(groupId, name) {
    const group = await GroupModel.findOne({ _id: groupId });
    if (!group) {
      throw ApiError.BadRequest("Неккоректный id группы");
    }

    await GroupModel.updateOne({ _id: groupId }, { name });
    return;
  }

  async addListToGroup(groupId, listId) {
    const group = await GroupModel.findOne({ _id: groupId });
    if (!group) {
      throw ApiError.BadRequest("Неккоректный id группы");
    }

    await GroupModel.updateOne({ _id: groupId }, { $push: { listId } });
    return;
  }

  async removeListFromGroup(groupId, listId) {
    const group = await GroupModel.findOne({ _id: groupId });
    if (!group) {
      throw ApiError.BadRequest("Неккоректный id группы");
    }

    await GroupModel.updateOne({ _id: groupId }, { $pull: { listId } });
    return;
  }

  async getGroupsNames(groupIds) {
    const groups = await GroupModel.find({ _id: { $in: groupIds } });
    if (!groups) {
      throw ApiError.BadRequest("Неккоректный id группы");
    }
    return groups.map((group) => group.name);
  }

  async getGroupName(groupId) { 
    const group = await GroupModel.findOne({ _id: groupId });
    if (!group) {
      throw ApiError.BadRequest("Неккоректный id группы");
    }
    return group.name;
  }

  async getGroup(groupId) {
    const group = await GroupModel.findOne({ _id: groupId });
    return group;
  }

  async getGroups(userId) {
    const groups = await GroupModel.find({ userId });

    if (!groups) {
      throw ApiError.BadRequest("Неккоректный id пользователя");
    }

    return groups.map((group) => new GroupDto(group));
  }
}

module.exports = new GroupService();
