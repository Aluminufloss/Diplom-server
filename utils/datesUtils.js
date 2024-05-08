const { format } = require("date-fns/format");
const { isEqual } = require("date-fns/isEqual");
const { isAfter } = require("date-fns/isAfter");
const { getDay } = require("date-fns/getDay");

const isDatesEqual = (date1, date2) => {
  const currentDate = format(date1, "yyyy-MM-dd");
  const plannedDate = format(date2, "yyyy-MM-dd");

  return isEqual(currentDate, plannedDate);
}

const isFirstDateAfterSecond = (date1, date2) => {
  const currentDate = format(date1, "yyyy-MM-dd");
  const plannedDate = format(date2, "yyyy-MM-dd");
  return isAfter(currentDate, plannedDate);
}

const getDayIndex = (date) => {
  return getDay(date);
}

const getDateInISOFormat = () => {
  return new Date().toISOString()
}

module.exports = { isDatesEqual, isFirstDateAfterSecond, getDayIndex, getDateInISOFormat };