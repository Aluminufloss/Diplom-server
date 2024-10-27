module.exports = class ListDto {
  listId;
  groupId;
  title;
  tasks;

  constructor(model) {
    this.listId = model._id;
    this.title = model.name;
    this.tasks = model.tasks;
    this.groupId = model.groupId;
  }
}