module.exports = class TaskDto {
  taskId;
  listId;
  title;
  status;
  priority;
  plannedDate;
  repeatDays;
  description;
  category;

  constructor(model) {
    this.taskId = model._id;
    this.listId = model.listId;
    this.title = model.title;
    this.status = model.status;
    this.priority = model.priority;
    this.plannedDate = model.plannedDate;
    this.repeatDays = model.repeatDays;
    this.description = model.description;
    this.category = model.category;
  }
}