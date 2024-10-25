const ListService = require("../service/list-service");

class ListController {
  async createGeneralLists(req, res, next) {
    try {
      const { userId } = req.body;
      const lists = await ListService.createGeneralLists(userId);
      return res.json(lists);
    } catch (err) {
      next(err);
    }
  }
  
  async createList(req, res, next) {
    try {
      const { title, groupId } = req.body;
      const { id } = req.user;

      const list = await ListService.createList(title, id, groupId);
      return res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async deleteList(req, res, next) {
    try {
      const { id } = req.user;
      const { listId } = req.params;
      await ListService.deleteList(listId, id);
      return res.json("Список был успешно удалён");
    } catch (err) {
      next(err);
    }
  }

  async getList(req, res, next) {
    try {
      const { listId } = req.params;
      const list = await ListService.getList(listId);
      return res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async getLists(req, res, next) {
    try {
      const { id } = req.user;
      const { lists, groups } = await ListService.getLists(id);
      return res.json({ lists, groups });
    } catch (err) {
      next(err);
    }
  }

  async getListName(req, res, next) {
    try {
      const { listId } = req.params;
      const listName = await ListService.getListName(listId);
      return res.json(listName);
    } catch (err) {
      next(err);
    }
  }

  async getAllListsNames(req, res, next) {
    try {
      const { listsIds } = req.body;
      const listsNames = await ListService.getAllListsNames(listsIds);
      return res.json(listsNames);
    } catch (err) {
      next(err);
    }
  }

  async getTasksByListId(req, res, next) {
    try {
      const { listId } = req.params;
      const tasks = await ListService.getTasksByListId(listId);
      return res.json(tasks);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ListController();
