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
}

module.exports = new ListController();