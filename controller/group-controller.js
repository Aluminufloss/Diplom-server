const GroupService = require("../service/group-service");

class GroupController {
  async createGroup(req, res, next) {
    try {
      const { name, userId } = req.body;
      const group = await GroupService.createGroup(name, userId);
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
}

module.exports = new GroupController();