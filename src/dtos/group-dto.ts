class GroupDto {
  id: string;
  name: string;
  lists;

  constructor(group) {
    this.id = group._id;
    this.name = group.name;
    this.lists = group.lists;
  }
}

export default GroupDto;
