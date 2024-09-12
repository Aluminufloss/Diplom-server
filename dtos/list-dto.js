module.exports = class ListDto {
  listId;
  title;
  tasks;

  constructor(model) {
    this.listId = model._id;
    this.title = model.name;
    this.tasks = model.tasks;
  }
}