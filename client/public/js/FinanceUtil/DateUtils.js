//------------------------------------------------------------------------------//
//                                                                              //
//                           DATE UTILITY FUNCTIONS                             //
//                                                                              //
//------------------------------------------------------------------------------//

Date.shortMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Month here is 1-indexed (January is 1, February is 2, etc). This is
// because we're using 0 as the day so that it returns the last day
// of the last month, so you have to add 1 to the month number
// so it returns the correct amount of days
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function getShortMonth(date) {
  return Date.shortMonths[date.getMonth()];
}

export function getDateString(date) {
  return date.getDate() + "-" + getShortMonth(date);
}

export function isSameDate(date1, date2) {
  return (
    date1.getUTCDate() == date2.getUTCDate() &&
    date1.getUTCMonth() == date2.getUTCMonth() &&
    date1.getUTCFullYear() == date2.getUTCFullYear()
  );
}

export function setUTCAndZeroHMS(date) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getDate());
}
