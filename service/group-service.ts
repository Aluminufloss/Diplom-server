import GroupModel from "../models/Group";
import UserModel from "../models/User";
import ListModel from "../models/List";

import ApiError from "../exceptions/api-error";

import GroupDto from "../dtos/group-dto";

interface ICreateGroupData {
  name: string;
  userId: string;
}

class GroupService {
  async createGroup({ name, userId }: ICreateGroupData): Promise<GroupDto> {
    const candidate = await UserModel.findOne({ _id: userId });

    if (!candidate) {
      throw ApiError.BadRequest(`User not found with this ID.`);
    }

    const group = await GroupModel.create({ name, userId });
    return new GroupDto(group);
  }

  async deleteGroup(groupId: string): Promise<void> {
    const group = await GroupModel.findOne({ _id: groupId });

    if (!group) {
      throw ApiError.BadRequest("Invalid group ID.");
    }

    // Delete all lists associated with the group
    await ListModel.deleteMany({ _id: { $in: group.lists } });

    await GroupModel.deleteOne({ _id: groupId });
  }

  async updateGroupName(groupId: string, name: string): Promise<void> {
    const group = await GroupModel.findOne({ _id: groupId });

    if (!group) {
      throw ApiError.BadRequest("Invalid group ID.");
    }

    await GroupModel.updateOne({ _id: groupId }, { name });
  }

  async addListToGroup(groupId: string, listId: string): Promise<void> {
    const group = await GroupModel.findOne({ _id: groupId });

    if (!group) {
      throw ApiError.BadRequest("Invalid group ID.");
    }

    await GroupModel.updateOne({ _id: groupId }, { $push: { lists: listId } });
  }

  async removeListFromGroup(groupId: string, listId: string): Promise<void> {
    const group = await GroupModel.findOne({ _id: groupId });

    if (!group) {
      throw ApiError.BadRequest("Invalid group ID.");
    }

    await GroupModel.updateOne({ _id: groupId }, { $pull: { lists: listId } });
  }

  async getGroupsNames(groupIds: string[]): Promise<string[]> {
    const groups = await GroupModel.find({ _id: { $in: groupIds } });

    if (!groups || groups.length === 0) {
      throw ApiError.BadRequest("Invalid group IDs.");
    }

    return groups.map((group) => group.name);
  }

  async getGroupName(groupId: string): Promise<string> {
    const group = await GroupModel.findOne({ _id: groupId });

    if (!group) {
      throw ApiError.BadRequest("Invalid group ID.");
    }

    return group.name;
  }

  async getGroup(groupId: string): Promise<GroupModel | null> {
    const group = await GroupModel.findOne({ _id: groupId });
    return group;
  }

  async getGroups(userId: string): Promise<GroupDto[]> {
    const groups = await GroupModel.find({ userId });

    if (!groups || groups.length === 0) {
      throw ApiError.BadRequest("No groups found for this user.");
    }

    return groups.map((group) => new GroupDto(group));
  }
}

export default new GroupService();
