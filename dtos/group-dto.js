module.exports = class GroupDto {
  id;
	name;
	lists;

  constructor(group) {
    this.id = group._id;
    this.name = group.name;
    this.lists = group.lists;
  }
}