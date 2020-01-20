import renderCalendarHTML from './renderCalendarHTML.js'
import {formatDate, formatMonth, getPreviousMonth, getNextMonth, getUTCDate} from '../../lib/dateUtil.js';
import createElement from '../../lib/createElement.js';

export default class RangePicker {
  constructor({from, to}) {
    this._from = getUTCDate(from);
    this._to = getUTCDate(to);
    this.selectorStartMonthOfYear = new Date(from.getFullYear(), from.getMonth(), 1);
    this._isSelectorOpen = false;     
    this.render();
  }

  get to() {
    return this._to;
  }

  set to(value) {
    this._to = getUTCDate(value);
    this.inputToElement.innerText = formatDate(value);
  }

  get from() {
    return this._from;
  }

  set from(value) {
    this._from = getUTCDate(value);
    this.inputFromElement.innerText = formatDate(value);
  }

  get isSelectorOpen() {
    return this._isSelectorOpen;
  }

  set isSelectorOpen(value) {    
    if (this._isSelectorOpen == value) return;
    this._isSelectorOpen = value;
    if (value) {
      this.elem.firstElementChild.classList.add('rangepicker_open');
      this.renderSelector();
    } else {
      this.elem.firstElementChild.classList.remove('rangepicker_open');
      this.selectorElem.innerHTML = '';
    }    
  }

  goLeft() {
    this.selectorStartMonthOfYear = getPreviousMonth(this.selectorStartMonthOfYear);
    if (this.isSelectorOpen) {
      this.renderSelector();
    }
  }

  goRight() {
    this.selectorStartMonthOfYear = getNextMonth(this.selectorStartMonthOfYear);
    if (this.isSelectorOpen) {
      this.renderSelector();
    }
  }

  render() {
    this.elem = document.createElement('div');
    this.elem.classList.add('container');
    this.elem.innerHTML = 
`<div class="rangepicker">
  <div class="rangepicker__input" data-elem="input">
    <span data-elem="from"></span> -
    <span data-elem="to"></span>
  </div>
  <div class="rangepicker__selector" data-elem="selector"></div>
</div>`;
    this.inputFromElement = this.elem.querySelector('[data-elem=from]');
    this.inputToElement = this.elem.querySelector('[data-elem=to]');
    this.inputElem = this.elem.querySelector('[data-elem=input]');
    this.selectorElem = this.elem.querySelector('[data-elem=selector]');
    this.from = this._from;
    this.to = this._to;

    let onInputElemClick = (function () {
      this.isSelectorOpen = !this.isSelectorOpen;
    }).bind(this);

    this.inputElem.addEventListener('click', onInputElemClick);

    let onSelectorElemClick = (function(event) {
      if (event.target.dataset.elem == 'controlLeft') {
        this.goLeft();
      } else if (event.target.dataset.elem == 'controlRight') {
        this.goRight();
      } else if (event.target.dataset.value) {
        let dateValue = new Date( Date.parse( event.target.dataset.value ) );
        if (!this.selectorSelection) {
          this.selectorSelection = new Array();
          this.selectorSelection.push(dateValue);
          this.renderSelector();
        } else {
          this.selectorSelection.push(dateValue);
        }
        if (this.selectorSelection.length == 2) {
          this.selectorSelection.sort( (a, b) => a.getTime() - b.getTime() );
          let changed = this.from.getTime() != this.selectorSelection[0].getTime() || this.to.getTime() != this.selectorSelection[1].getTime();
          this.from = this.selectorSelection[0];
          this.to = this.selectorSelection[1];         
          this.selectorSelection = null;
          this.isSelectorOpen = false;
          if (changed) {
            this.elem.dispatchEvent(new CustomEvent('rangePicker-dateChanged', {
              bubbles: true,
              detail: { from: new Date(this.from), to: new Date(this.to) }
            }));
          }
        }
      }

    }).bind(this);
    this.selectorElem.addEventListener('click', onSelectorElemClick);
  }

  renderSelector() {
    let dateRange;
    if (this.selectorSelection) {
      dateRange = { 
        from: this.selectorSelection[0], 
        to: this.selectorSelection[0] 
      };
    } else {
      dateRange = { from: this.from, to: this.to };
    }
    var leftMonth = this.selectorStartMonthOfYear;
    let rightMonth = getNextMonth(this.selectorStartMonthOfYear);
    this.selectorElem.innerHTML = 
`<div class="rangepicker__selector-arrow"></div>
<div class="rangepicker__selector-control-left" data-elem="controlLeft"></div>
<div class="rangepicker__selector-control-right" data-elem="controlRight"></div>
<div class="rangepicker__calendar">${renderCalendarHTML(leftMonth, dateRange)}</div>
<div class="rangepicker__calendar">${renderCalendarHTML(rightMonth, dateRange)}</div>`;
  }
}