const { getDayIndex } = require("./datesUtils");

module.exports = planeNewRepeatDate = (date, repeatDays) => {
  const dateFromString = new Date();

  const dayIndex =
    getDayIndex(dateFromString) === 0 ? 7 : getDayIndex(dateFromString);

  const repeatDaysIndexes = repeatDays.reduce((acc, day, index) => {
    if (day.isSelected) {
      acc.push(index + 1);
    }

    return acc;
  }, []);


  if (!repeatDaysIndexes.length) {
    return date;
  }

  for (const idx of repeatDaysIndexes) {
    if (idx > dayIndex) {
      return new Date(
        dateFromString.setDate(dateFromString.getDate() + idx - dayIndex)
      ).toISOString();
    }
  }

  return new Date(
    dateFromString.setDate(
      dateFromString.getDate() + repeatDaysIndexes[0] - dayIndex + 7
    )
  ).toISOString();
};
