import escapeHTML from '../../lib/escapeHTML.js'
import createGetter from '../../lib/createGetter.js'
import fetchJson from '../../lib/fetchJson.js'
import createElement from '../../lib/createElement.js'

const DEFAULT_SORT_DIRECTION = 1;
const INITIAL_DATA_PAGE_SIZE = 25;
const DATA_PAGE_SIZE = 10;
const MIN_SCROLL_BOTTOM = 100;

export default class SortableTable {
  /**
   * @param {string} url data feed
   * @param {boolean} isDynamic load data on scroll
   * @param {Object} range data range to fetch
   * @param {Date} range.from start date
   * @param {Date} range.to end date
   * @param {Object[]} fields fields description
   * @param {Object} order initial sorting
   * @param {string} order.fieldName Field name
   * @param {integer} order.direction 1: ascending, -1: descending
   */
  constructor({url, isDynamic, range, fields, order, emptyPlaceholder}) {
    this.url = new URL(url, location.href);
    this.isDynamic = isDynamic;
    this.range = { from: range.from, to: range.to };
    this.fields = fields;
    this.order = order;
    this.emptyPlaceholder = emptyPlaceholder ? emptyPlaceholder : "No data rows to display.";
    this.tableRows = new Array();
    this._render();
  }

  _render() {
    this.elem = createElement(
      `<div class="sortable-table" style="--grid-template-columns: ${this.fields.map(field => field.width).join(" ")}">
        <div data-elem="grid" class="sortable-table__grid"></div>
        <div data-elem="loading" class="sortable-table__loading-line"></div>
        <div data-elem="emptyPlaceholder" class="sortable-table__empty-placeholder"></div>
      </div>`);
    this.elems = {};
    for (let subElem of this.elem.querySelectorAll('[data-elem]')) {
      this.elems[subElem.dataset.elem] = subElem;
    }

    this.elems.emptyPlaceholder.append(this.emptyPlaceholder);

    this.elems.grid.addEventListener('click', this._onHeaderClick);
    window.addEventListener('scroll', this._onScroll);
    
    this.renderGrid();
  }

  setRange(range) {
    if (this.range.from != range.from || this.range.to != range.to) {
      this.range = { from: new Date(range.from), to: new Date(range.to) };
      console.log(this.range.from.toISOString() + " " + this.range.to.toISOString());
      this.allDataLoaded = false;
      this.tableRows = new Array();
      this.renderGrid();
    }
  }

  renderGrid() {
    this.elems.grid.innerHTML = this._renderHeadersHTML();
    this._loadRows();
  }

  async _loadRows() {
    if (this.allDataLoaded) {
      this._sort();
      this._renderRows(this.tableRows);
      return;
    }
    this.isLoading = true;
    this.elems.emptyPlaceholder.classList.remove('sortable-table__empty-placeholder_visible');
    this.elems.loading.classList.add('sortable-table__loading-line_visible');
    this.url.searchParams.set('from', this.range.from.toISOString());
    this.url.searchParams.set('to', this.range.to.toISOString());
    if (this.isDynamic) {
      this.url.searchParams.set('_start', this.tableRows.length);
      this.url.searchParams.set('_end', this.tableRows.length + (this.tableRows.length ? DATA_PAGE_SIZE : INITIAL_DATA_PAGE_SIZE));
      this.url.searchParams.set('_sort', this.order.fieldName);
      this.url.searchParams.set('_order', this.order.direction == 1 ? "asc" : "desc");
    }
    let data;
    try {
      data = await fetchJson(this.url);
      if (!this.isDynamic || data.length == 0) {
        this.allDataLoaded = true;
      }
    } finally {
      this.isLoading = false;
      this.elems.loading.classList.remove('sortable-table__loading-line_visible');
      if (data && data.length > 0) {
        this.tableRows.push(...data);
        if (!this.isDynamic) {
          this._sort();
          data = this.tableRows;
        }
        this._renderRows(data);
      }
      if (!this.tableRows.length) {
        this.elems.emptyPlaceholder.classList.add('sortable-table__empty-placeholder_visible');
      }
    }
  }

  _renderHeadersHTML() {
    let html = '';
    for (let fieldObj of this.fields) {
      let sortMod = this._renderTitleSortModificator(fieldObj);
      html += 
      `<div class="sortable-table__item sortable-table__item_header" data-name="${fieldObj.fieldName}" ${fieldObj.compare ? "data-sortable" : ""}>
        <span class="sortable-table__title ${sortMod}">${escapeHTML(fieldObj.title)}</span>
      </div>`;
    }
    return html;
  }

  _renderTitleSortModificator(fieldObj) {
    if (this.order.fieldName == fieldObj.fieldName) {
      return `sortable-table__title_order_${this.order.direction == 1 ? 'ascending' : 'descending' }`;
    }
    return '';
  }

  _renderRows(rowsData) {
    let rowsHTML = `<div>${this._renderRowsHTML(rowsData)}</div>`;
    let rows = createElement(rowsHTML).children;
    this.elems.grid.append(...rows);
  }

  _renderRowsHTML(rowsData) {
    let html = '';
    for (let row of rowsData) {
      html += this._renderRowHTML(row);
    }
    return html;
  }

  _renderRowHTML(rowData) {
    let html = '';
    for (let fieldObj of this.fields) {
      html += this._renderCellHTML(rowData, fieldObj);
    }
    return html;
  }

  _renderCellHTML(rowData, fieldObj) {
    return `<div class="sortable-table__item">${this._renderCellContentsHTML(rowData, fieldObj)}</div>`;
  }

  _renderCellContentsHTML(rowData, fieldObj) {
    let getter = createGetter(fieldObj.fieldName);
    let rawText = getter(rowData);
    return fieldObj.render(rawText);
  }

  _sort() {
    let fieldObj = this.fields.find(x => x.fieldName == this.order.fieldName);
    let fieldGetter = createGetter(this.order.fieldName);
    let compare = (a, b) => fieldObj.compare(fieldGetter(a), fieldGetter(b)) * this.order.direction;
    this.tableRows.sort(compare);
  }

  sortByFieldName(fieldName) {
    if (this.order.fieldName == fieldName) {
      this.order.direction = -this.order.direction;
    } else {
      this.order.fieldName = fieldName;
      this.order.direction = DEFAULT_SORT_DIRECTION;
    }
    if (!this.allDataLoaded && this.isDynamic) {
      this.tableRows = new Array();
    }
    this.renderGrid();
  }

  _onHeaderClick = (event) => {
    let header = event.target.closest('[data-name]');
    if (header && header.dataset.sortable != undefined) {
      let fieldName = header.dataset.name;
      this.sortByFieldName(fieldName);
    }
  }

  _onScroll = (event) => {
    if (this.isLoading) return;
    if (!this.allDataLoaded && this._getScrollLeft() < MIN_SCROLL_BOTTOM) {
      this._loadRows();
    }
  }

  _getScrollLeft() {
    return document.documentElement.getBoundingClientRect().bottom - document.documentElement.clientHeight;
  }
}