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
      const { groupId } = req.params;
      await GroupService.deleteGroup(groupId);
      return res.json("Группа успешно удалена");
    } catch (err) {
      next(err);
    }
  }

  async updateGroupName(req, res, next) {
    try {
      const { groupId } = req.params;
      const { name } = req.body;
      const { id } = req.user;

      await GroupService.updateGroupName(groupId, name, id);

      return res.json("Нзвание группы успешно изменено");
    } catch (err) {
      next(err);
    }
  }

  async addListToGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      const { listId } = req.body;

      await GroupService.addListToGroup(groupId, listId);

      return res.json("Лист был успешно добавлен в группу");
    } catch (err) {
      next(err);
    }
  }

  async removeListFromGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      const { listId } = req.body;

      await GroupService.removeListFromGroup(groupId, listId);
      return res.json("Лист был успешно удалён из группы");
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
      const { groupId } = req.params;
      const groupName = await GroupService.getGroupName(groupId);
      return res.json(groupName);
    } catch (err) {
      next(err);
    }
  }

  async getGroups(req, res, next) {
    try {
      const { id } = req.user;
      const groups = await GroupService.getGroups(id);
      return res.json(groups);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new GroupController();
