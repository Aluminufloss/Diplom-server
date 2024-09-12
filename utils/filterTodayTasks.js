const { isDatesEqual } = require("../utils/datesUtils");
const planeNewRepeatDate = require("./planeNewRepeatDate");

function filterTodayTasks (tasks) {
  const tasksToDeleteFromToday = [];

  const filteredTodayTasks = tasks.filter((task) => {
    if (!isDatesEqual(new Date(task.plannedDate), new Date())) {
      tasksToDeleteFromToday.push(task._id);

      const newPlannedDate = planeNewRepeatDate(task.plannedDate, task.repeatDays);

      if (newPlannedDate === task.plannedDate) {
        task.status = "expired";
      } else {
        task.status = "active";
        task.plannedDate = newPlannedDate;
      }
      
      task.save();

      return false;
    }

    return true
  });

  return { filteredTodayTasks, tasksToDeleteFromToday };
}

module.exports = filterTodayTasks;