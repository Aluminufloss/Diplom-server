const GroupService = require("../service/group-service");

class GroupController {
  async createGroup(req, res, next) {
    try {
      const { name } = req.body;
      const { id } = req.user;
      const group = await GroupService.createGroup(name, id);
      return res.json(group);
    } catch (err) {
      next(err);
    }
  }

  async deleteGroup(req, res, next) {
    try {
      const { groupId } = req.body;
      const group = await GroupService.deleteGroup(groupId);
      return res.json(group);
    } catch (err) {
      next(err);
    }
  }

  async updateGroupName(req, res, next) {
    try {
      const { groupId, name } = req.body; 
      const group = await GroupService.updateGroupName(groupId, name, userId);
      return res.json(group);
    } catch (err) {
      next(err);
    }
  }

  async addListToGroup(req, res, next) {
    try {
      const { groupId, listId } = req.body;
      const group = await GroupService.addListToGroup(groupId, listId);
      return res.json(group);
    } catch (err) {
      next(err);
    }
  }

  async removeListFromGroup(req, res, next) {
    try {
      const { groupId, listId } = req.body;
      const group = await GroupService.removeListFromGroup(groupId, listId);
      return res.json(group);
    } catch (err) {
      next(err);
    }
  }

  async getGroupsNames(req, res, next) {
    try {
      const { groupIds } = req.body;
      const groupsNames = await GroupService.getGroupsNames(groupIds);
      return res.json(groupsNames);
    } catch (err) {
      next(err);
    }
  }

  async getGroupName(req, res, next) {
    try {
      const { groupId } = req.body;
      const groupName = await GroupService.getGroupName(groupId);
      return res.json(groupName);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new GroupController();