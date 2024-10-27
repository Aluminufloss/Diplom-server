const { getDayIndex } = require("./datesUtils");

module.exports = checkRepeatDays = (date, repeatDays) => {
  const dayIndex = getDayIndex(new Date(date));

  const repeatDaysIndexes = repeatDays.reduce((acc, day, index) => {
    if (day.isSelected) {
      acc.push(index + 1);
    }

    return acc;
  }, []);

  const isRepeatDay = repeatDaysIndexes.includes(dayIndex);

  return isRepeatDay;
}