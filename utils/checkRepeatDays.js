const { getDayIndex } = require("./datesUtils");

module.exports = checkRepeatDays = (repeatDays) => {
  const todayDayIndex = getDayIndex(new Date());

  const repeatDaysIndexes = repeatDays.reduce((acc, day, index) => {
    if (day.isSelected) {
      acc.push(index + 1);
    }

    return acc;
  }, []);

  const isRepeatDay = repeatDaysIndexes.includes(todayDayIndex);

  return isRepeatDay;
}