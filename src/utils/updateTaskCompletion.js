const { isDatesEqual } = require("./datesUtils");

const updateTaskCompletion = ({
  taskCompletion,
  task,
  status,
  isRepeatedTask,
}) => {
  const currentDate = new Date().toISOString();

  const hasPreviousCompletion = taskCompletion.completedAt.length > 0;

  if (
    hasPreviousCompletion &&
    isDatesEqual(
      new Date(),
      new Date(
        taskCompletion.completedAt[taskCompletion.completedAt.length - 1]
      )
    )
  ) {
    const latestCompletionIndex = taskCompletion.completedAt.length - 1;
    taskCompletion.statuses[latestCompletionIndex] = status;
    taskCompletion.categories[latestCompletionIndex] = task.category;
    taskCompletion.priorities[latestCompletionIndex] = task.priority;

    if (status === "completed") {
      taskCompletion.timeDurations[latestCompletionIndex] = {
        hours: task.timeDuration.hours,
        minutes: task.timeDuration.minutes,
      };
    } else {
      taskCompletion.timeDurations[latestCompletionIndex] = {
        hours: 0,
        minutes: 0,
      };
    }
  } else {
    taskCompletion.statuses.push(status);
    taskCompletion.completedAt.push(currentDate);
    taskCompletion.categories.push(task.category);
    taskCompletion.priorities.push(task.priority);

    if (status === "completed") {
      taskCompletion.timeDurations.push({
        hours: task.timeDuration.hours,
        minutes: task.timeDuration.minutes,
      });
    } else {
      taskCompletion.timeDurations.push({
        hours: 0,
        minutes: 0,
      });
    }
  }

  taskCompletion.isRepeatedTask = isRepeatedTask;

  return taskCompletion;
};

module.exports = updateTaskCompletion;
