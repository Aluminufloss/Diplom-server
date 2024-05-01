const { isDatesEqual } = require("../utils/datesUtils");

function filterTodayTasks (tasks) {
  const tasksToDeleteFromToday = [];

  const filteredTodayTasks = tasks.filter((task) => {
    if (!isDatesEqual(task.plannedDate, new Date())) {
      tasksToDeleteFromToday.push(task._id);

      task.status = "expired";
      task.save();

      return false;
    }

    return true
  });

  return { filteredTodayTasks, tasksToDeleteFromToday };
}

module.exports = filterTodayTasks;