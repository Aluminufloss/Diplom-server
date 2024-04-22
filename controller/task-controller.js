const taskService = require("../service/task-service");

class TaskController {
  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask({
        title: req.body.title,
        description: req.body.description,
        listId: req.body.listId,
        priority: req.body.priority,
        plannedDate: req.body.plannedDate,
        repeat: req.body.repeat,
        category: req.body.category,
        userId: req.body.userId
      });

      return res.json(task);
    } catch (err) {
      console.log("err", err)
      next(err);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const { taskId, userId } = req.body;
      await taskService.deleteTask(taskId, userId);
      return res.json("Задача была успешно удалена");
    } catch (err) {
      next(err);
    }
  }

  async updateTask(req, res, next) {
    try {
      const { taskId, updatedTaskData } = req.body;
      const task = await taskService.updateTask(taskId, updatedTaskData);
      return res.json(task);
    } catch (err) {
      next(err);
    }
  }

  async getTask(req, res, next) {
    try {
      const { taskId } = req.body;
      const task = await taskService.getTask(taskId);
      return res.json(task);
    } catch (err) {
      next(err);
    }
  }

  async getTodayTasks(req, res, next) {
    try {
      const { userId } = req.body;
      const tasks = await taskService.getTodayTasks(userId);
      return res.json(tasks);
    } catch (err) {
      next(err);
    }
  }

  async getPlannedTasks(req, res, next) {
    try {
      const { userId } = req.body;
      const tasks = await taskService.getPlannedTasks(userId);
      return res.json(tasks);
    } catch (err) {
      next(err);
    }
  }

  async getAllTasks(req, res, next) {
    try {
      const { userId } = req.body;
      const tasks = await taskService.getAllTasks(userId);
      return res.json(tasks);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TaskController();
