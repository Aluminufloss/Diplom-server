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
      const { title } = req.body;
      const { id } = req.user;
      const list = await ListService.createList(title, id);
      return res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async deleteList(req, res, next) {
    try {
      const { id } = req.user;
      const { listId } = req.body;
      await ListService.deleteList(listId, id);
      return res.json("Список был успешно удалён");
    } catch (err) {
      next(err);
    }
  }

  async getList(req, res, next) {
    try {
      const { listId } = req.body;
      const list = await ListService.getList(listId);
      return res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async getLists(req, res, next) {
    try {
      const { id } = req.user;
      const lists = await ListService.getLists(id);
      return res.json(lists);
    } catch (err) {
      next(err);
    }
  }

  async getListName(req, res, next) {
    try {
      const { listId } = req.body;
      const listName = await ListService.getListName(listId);
      return res.json(listName);
    } catch (err) {
      next(err);
    }
  }

  async getAllListsNames(req, res, next) {
    try {
      const { listsId } = req.body;
      const listsNames = await ListService.getAllListsNames(listsId);
      return res.json(listsNames);
    } catch (err) {
      next(err);
    }
  }

  async getTasksByListId(req, res, next) {
    try {
      const { listId } = req.body;
      const tasks = await ListService.getTasksByListId(listId);
      return res.json(tasks);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ListController();