const ListDto = require("../dtos/list-dto");
const groupService = require("../service/group-service");

module.exports = makeGroupsFromLists = async (lists) => {
  const groups = {};
  const resultGroups = [];
  const listsWithoutGroups = [];

  for (const list of lists) {
    const formattedList = new ListDto(list);

    if (!list.groupId) {
      listsWithoutGroups.push(formattedList);
      break;
    }

    if (!groups[list.groupId]) {
      groups[list.groupId] = [formattedList];
    } else {
      groups[list.groupId].push(formattedList);
    }
  }

  for (const groupId of Object.keys(groups)) {
    const groupName = await groupService.getGroupName(groupId);
    console.log("groupName ----- ", groupName);

    const newGroup = {
      id: groupId,
      name: groupName ?? "Группа",
      lists: groups[groupId],
    };

    resultGroups.push(newGroup);
  }

  console.log("resultGroups ----- ", resultGroups);

  console.log("listsWithoutGroups ----- ", listsWithoutGroups);

  return { groups: resultGroups, lists: listsWithoutGroups };
};
