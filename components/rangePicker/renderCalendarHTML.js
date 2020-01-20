  import {formatMonth, getUTCDate} from '../../lib/dateUtil.js';
  
  /**
   * @param {Date} monthOfYear month to show
   * @param {Date} date date to highlight
   * @param {boolean} endDate should provided date be treated as an end date
   */
export default function renderCalendarHTML(monthOfYear, {from, to}) {
    let monthName = formatMonth(monthOfYear);
    from = getUTCDate(from);
    to = getUTCDate(to);
    let calendarHTML = 
`  <div class="rangepicker__month-indicator">
    <time datetime="${monthName}">${monthName}</time>
  </div>
  <div class="rangepicker__day-of-week">
    <div>Пн</div>
    <div>Вт</div>
    <div>Ср</div>
    <div>Чт</div>
    <div>Пт</div>
    <div>Сб</div>
    <div>Вс</div>
  </div>
  ${renderGridHTML()}`;

  function renderGridHTML() {
    let gridHTML = `<div class="rangepicker__date-grid">`;
    let d = getUTCDate(new Date(monthOfYear.getFullYear(), monthOfYear.getMonth(), 1));
    // пробелы для первого ряда
    // с понедельника до первого дня месяца
    // * * * 1  2  3  4
    for (let i = 0; i < getDay(d); i++) {
      gridHTML += '\n<div></div>';
    }

    // <button> ячейки календаря с датами
    while (d.getMonth() == monthOfYear.getMonth()) {
      let classList = getClassList(d);
      gridHTML += `\n<button type="button" class="${classList.join(' ')}" data-value="${d.toISOString()}">${d.getDate()}</button>`;
      d.setDate(d.getDate() + 1);
    }      

    // добить таблицу пустыми ячейками, если нужно
    // 29 30 31 * * * *
    if (getDay(d) != 0) {
      for (let i = getDay(d); i < 7; i++) {
        gridHTML += '\n<div></div>';
      }
    }

    // закрыть таблицу
    gridHTML += '\n</div>';

    function getDay(date) { // получить номер дня недели, от 0 (пн) до 6 (вс)
      let day = date.getDay();
      if (day == 0) day = 7; // сделать воскресенье (0) последним днем
      return day - 1;
    }

    function getClassList(dayOfMonth) {
      let classList = new Array();
      classList.push('rangepicker__cell');
      if (dayOfMonth.getTime() == from.getTime()) {
        classList.push('rangepicker__selected-from');
      } else if (dayOfMonth.getTime() == to.getTime()) {
        classList.push('rangepicker__selected-to');
      } else if (dayOfMonth.getTime() > from.getTime() &&
                  dayOfMonth.getTime() < to.getTime()) {
        classList.push('rangepicker__selected-between');
      }
      return classList;
    }

    return gridHTML;
  }
  return calendarHTML;
}