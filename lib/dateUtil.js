export function formatDate(date) {
  return date.toLocaleDateString();
  // return [
  //   '0' + date.getDate(),
  //   '0' + (date.getMonth() + 1),
  //   '' + date.getFullYear()
  // ].map(component => component.slice(-2)).join('/');
}

export function formatMonth (date, locale) {
  locale = locale ? locale : "ru";
  let month = date.toLocaleString(locale, { month: "long" });
  return month;
}

export function getPreviousMonth(date) {
  let d = new Date(date.getFullYear(), date.getMonth(), 0);
  d.setDate(1);
  return d;
}

export function getNextMonth(date) {
  let currentMonth = date.getMonth();
  let d = new Date(date.getFullYear(), currentMonth, 1);
  d.setMonth(currentMonth + 1);
  return d;
}

export function getUTCDate(date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
}