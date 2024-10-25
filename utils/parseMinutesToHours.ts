import { TimeDuration } from "../types/global";

/**
 * @param {TimeDuration} time - object with hours and minutes
 * @returns {TimeDuration} - object with hours and minutes
 */
const parseMinutesToHours = (time: TimeDuration): TimeDuration => {
  const totalMinutes = time.hours * 60 + time.minutes;
  const hours = Math.floor(totalMinutes / 60);

  const remainingMinutes = totalMinutes % 60;

  return { hours, minutes: remainingMinutes };
};

export default parseMinutesToHours;
