import SortableTable from '../sortableTable/index.js';

export default class Bestsellers extends SortableTable {
    _renderCellHTML(rowData, fieldObj) {
      let url = `/products/${encodeURIComponent(rowData.id)}`;
    return `<a class="sortable-table__item" href="${url}">${this._renderCellContentsHTML(rowData, fieldObj)}</a>`;
  }
}