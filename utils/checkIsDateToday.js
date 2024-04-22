const checkIsDateToday = (date1, date2) => {
  const date1Day = new Date(date1).getDate();
  const date2Day = date2.getDate();

  const date1Month = new Date(date1).getMonth();
  const date2Month = date2.getMonth();

  return date1Day === date2Day && date1Month === date2Month;
}

module.exports = { checkIsDateToday };