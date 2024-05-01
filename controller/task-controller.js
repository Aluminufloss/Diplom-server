const TaskService = require("../service/task-service");

class TaskController {
  async createTask(req, res, next) {
    try {
      const { id } = req.user;
      const task = await TaskService.createTask(req.body.taskData, id);
      return res.json(task);
    } catch (err) {
      next(err);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const { id } = req.user;
      const { taskId } = req.body;
      await TaskService.deleteTask(taskId, id);
      return res.json("Задача была успешно удалена");
    } catch (err) {
      next(err);
    }
  }

  async updateTask(req, res, next) {
    try {
      const { id } = req.user;
      const { taskData } = req.body;
      const task = await TaskService.updateTask(taskData, id);
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
      const { id } = req.user;
      const tasks = await TaskService.getTodayTasks(id);
      return res.json(tasks);
    } catch (err) {
      next(err);
    }
  }

  async getPlannedTasks(req, res, next) {
    try {
      const { id } = req.user;
      const tasks = await TaskService.getPlannedTasks(id);
      return res.json(tasks);
    } catch (err) {
      next(err);
    }
  }

  async getAllTasks(req, res, next) {
    try {
      const { id } = req.user;
      const tasks = await TaskService.getAllTasks(id);
      return res.json(tasks);
    } catch (err) {
      next(err);
    }
  }

  async changeTaskStatus(req, res, next) {
    try {
      const { taskId, status } = req.body;
      await TaskService.changeTaskStatus(taskId, status);
      return res.json("Статус задачи был успешно изменен");
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TaskController();