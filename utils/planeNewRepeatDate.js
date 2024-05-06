const checkRepeatDays = require("./checkRepeatDays");
const { getDayIndex } = require("./datesUtils");

module.exports = planeNewRepeatDate = (date, repeatDays) => {
  try {
    const isTodayRepeatDay = checkRepeatDays(repeatDays);
    const dateFromString = new Date(date);

    if (isTodayRepeatDay) {
      return date;
    }

    const repeatDaysIndexes = repeatDays.reduce((acc, day, index) => {
      if (day.isSelected) {
        acc.push(index + 1);
      }
  
      return acc;
    }, []);

    const todayIndex = getDayIndex(new Date());

    for (const idx of repeatDaysIndexes) {
      if (idx > todayIndex) {
        return new Date(
          dateFromString.setDate(dateFromString.getDate() + idx - todayIndex)
        ).toISOString();
      }
    }

    return new Date(
      dateFromString.setDate(
        dateFromString.getDate() + repeatDaysIndexes[0] - todayIndex + 7
      )
    ).toISOString();
  } catch (err) {
    console.log("Error in planeNewRepeatDate:", err);
  }
};
