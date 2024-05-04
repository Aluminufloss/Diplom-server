module.exports = class GroupDto {
  id;
	name;
	lists;
	userId;

  constructor(group) {
    this.id = group._id;
    this.name = group.name;
    this.lists = group.lists;
    this.userId = group.userId;
  }
}