const GroupDto = require("../dtos/group-dto");
const groupService = require("../service/group-service");

module.exports = makeGroupsFromLists = async (lists, userGroups) => {
  const groups = {};
  const resultGroups = [];
  const resultLists = [];

  for (const list of lists) {
    if (list.groupId) {
      if (!groups[list.groupId]) {
        groups[list.groupId] = [list.listId];
      } else {
        groups[list.groupId].push(list.listId);
      }
    }

    resultLists.push(list);
  }

  for (const groupId of Object.keys(groups)) {
    const groupName = await groupService.getGroupName(groupId);

    const newGroup = {
      id: groupId,
      name: groupName ?? "Группа",
      lists: groups[groupId],
    };

    resultGroups.push(newGroup);
  }

  userGroups.forEach((group) => {
    if (!group.lists.length) {
      resultGroups.push(new GroupDto(group));
    }
  });

  return { groups: resultGroups, lists: resultLists };
};
