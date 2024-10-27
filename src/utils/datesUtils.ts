import { format } from "date-fns/format";
import { isEqual } from "date-fns/isEqual";
import { isAfter } from "date-fns/isAfter";
import { getDay } from "date-fns/getDay";

/**
 * Checks if two dates are equal.
 * @param date1 - The first date to compare.
 * @param date2 - The second date to compare.
 * @returns True if the dates are equal, false otherwise.
 */
const isDatesEqual = (date1: Date, date2: Date): boolean => {
  const currentDate = format(date1, "yyyy-MM-dd");
  const plannedDate = format(date2, "yyyy-MM-dd");

  return isEqual(currentDate, plannedDate);
};

/**
 * Checks if the first date is after the second date.
 * @param date1 - The first date to compare.
 * @param date2 - The second date to compare.
 * @returns True if the first date is after the second date, false otherwise.
 */
const isFirstDateAfterSecond = (date1: Date, date2: Date): boolean => {
  const currentDate = format(date1, "yyyy-MM-dd");
  const plannedDate = format(date2, "yyyy-MM-dd");

  return isAfter(currentDate, plannedDate);
};

/**
 * Gets the index of the day in the week (from 0 to 6) for the given date.
 * @param date - The date to get the day index for.
 * @returns The index of the day in the week (from 0 to 6).
 */
const getDayIndex = (date: Date): number => {
  return getDay(date);
};

/**
 * Gets the current date in ISO format.
 * @returns The current date in ISO format.
 */
const getDateInISOFormat = (): string => {
  return new Date().toISOString();
};

export {
  isDatesEqual,
  isFirstDateAfterSecond,
  getDayIndex,
  getDateInISOFormat,
};
