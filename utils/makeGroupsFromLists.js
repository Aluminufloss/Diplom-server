const GroupDto = require("../dtos/group-dto");
const groupService = require("../service/group-service");

module.exports = makeGroupsFromLists = async (lists, userGroups) => {
  const groups = {};
  const resultGroups = [];
  const listsWithoutGroups = [];

  for (const list of lists) {
    if (!list.groupId) {
      listsWithoutGroups.push(list);
      continue;
    }

    if (!groups[list.groupId]) {
      groups[list.groupId] = [list];
    } else {
      groups[list.groupId].push(list);
    }
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

  console.log("resultGroups", resultGroups);

  return { groups: resultGroups, lists: listsWithoutGroups };
};
