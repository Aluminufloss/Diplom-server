const TaskService = require("../service/task-service");

class TaskController {
  async createTask(req, res, next) {
    try {
      const {
        title,
        description,
        listId,
        userId,
        plannedDate,
        repeat,
        priority,
        category,
      } = req.body;

      const task = await TaskService.createTask({
        title,
        description,
        listId,
        userId,
        plannedDate,
        repeat,
        priority,
        category,
      });

      return res.json(task);
    } catch (err) {
      console.log("err", err);
      next(err);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const { taskId, userId } = req.body;
      await TaskService.deleteTask(taskId, userId);
      return res.json("Задача была успешно удалена");
    } catch (err) {
      next(err);
    }
  }

  async updateTask(req, res, next) {
    try {
      const { taskId, taskData } = req.body;
      const task = await TaskService.updateTask(taskId, taskData);
      return res.json(task);
    } catch (err) {
      next(err);
    }
  }

  async getTask(req, res, next) {
    try {
      const { taskId } = req.body;
      const task = await TaskService.getTask(taskId);
      return res.json(task);
    } catch (err) {
      next(err);
    }
  }

  async getTodayTasks(req, res, next) {
    try {
      const { userId } = req.body;
      const tasks = await TaskService.getTodayTasks(userId);
      return res.json(tasks);
    } catch (err) {
      next(err);
    }
  }

  async getPlannedTasks(req, res, next) {
    try {
      const { userId } = req.body;
      const tasks = await TaskService.getPlannedTasks(userId);
      return res.json(tasks);
    } catch (err) {
      next(err);
    }
  }

  async getAllTasks(req, res, next) {
    try {
      const { userId } = req.body;
      const tasks = await TaskService.getAllTasks(userId);
      return res.json(tasks);
    } catch (err) {
      next(err);
    }
  }

  async changeTaskStatus(req, res, next) {
    try {
      const { taskId, status } = req.body;
      const task = await TaskService.changeTaskStatus(taskId, status);
      return res.json(task);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TaskController();
