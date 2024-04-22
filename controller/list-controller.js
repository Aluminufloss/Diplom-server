const ListService = require("../service/list-service");

class ListController {
  async createGeneralLists(req, res) {
    try {
      const { userId } = req.body;
      const lists = await ListService.createGeneralLists(userId);
      return res.json(lists);
    } catch (err) {
      console.log("err", err)
    }
  }
  async createList(req, res) {
    try {
      const { name, userId } = req.body;
      const list = await ListService.createList(name, userId);
      return res.json(list);
    } catch (err) {
      console.log("err", err)
    }
  }

  async deleteList(req, res) {
    try {
      const { listId, userId } = req.body;
      const list = await ListService.deleteList(listId, userId);
      return res.json(list);
    } catch (err) {
      console.log("err", err)
    }
  }

  async getList(req, res) {
    try {
      const { listId } = req.body;
      const list = await ListService.getList(listId);
      return res.json(list);
    } catch (err) {
      console.log("err", err)
    }
  }
}

module.exports = new ListController();