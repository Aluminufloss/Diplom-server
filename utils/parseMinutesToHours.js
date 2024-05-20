module.exports = parseMinutesToHours = (time) => {
  const totalMinutes = time.hours * 60 + time.minutes;
  const hours = Math.floor(totalMinutes / 60);

  const remainingMinutes = totalMinutes % 60;

  return { hours, minutes: remainingMinutes };
};
