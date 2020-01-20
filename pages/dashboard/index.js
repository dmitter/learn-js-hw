import Bestsellers from '../../components/bestsellers/index.js';
import RangePicker from '../../components/rangePicker/index.js';
import ColumnChart from '../../components/columnChart/index.js';
import fieldTypes from '../../components/sortableTable/fieldTypes.js';
import createElement from "../../lib/createElement.js";
import formatMoney from "../../lib/formatMoney.js";

export default class DashboardPage {

  tableFields = [
    Object.assign(Object.create(fieldTypes.image), {
      fieldName: "images[0].url",
      title: "Image",
      width: "70px"
    }),
    Object.assign(Object.create(fieldTypes.string), {
      fieldName: "title",
      title: "Name",
      width: "4fr"
    }),
    Object.assign(Object.create(fieldTypes.string), {
      fieldName: "subcategory.title",
      title: "Category",
      width: "1fr"
    }),
    Object.assign(Object.create(fieldTypes.number), {
      fieldName: "quantity",
      title: "Quantity",
      width: "1fr"
    }),
    Object.assign(Object.create(fieldTypes.currency), {
      fieldName: "price",
      title: "Price",
      width: "1fr"
    }),
    Object.assign(Object.create(fieldTypes.number), {
      fieldName: "sales",
      title: "Sales",
      width: "1fr"
    })
  ];

  render() {
    let elem = createElement(`<div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h3>
      </div>
      <div class="dashboard__charts"></div>
      <h3 class="block-title">Best sellers</h3>
    </div>`);
    this.range = {
       from: new Date(),
       to: new Date()
    };
    this.range.from.setMonth(this.range.to.getMonth() - 1);

    let rangePicker = this.renderRangePicker();
    elem.querySelector('.content__top-panel').append(rangePicker.elem);

    this.components = this.renderCharts();
    elem.querySelector('.dashboard__charts').append(...this.components.map(c => c.elem));

    let table = this.renderTable();
    this.components.push(table);
    elem.append(table.elem);
    return elem;
  }

  renderTable() {
    let table = new Bestsellers({
      url: 'https://course-js.javascript.ru/api/dashboard/bestsellers',
      isDynamic: false,
      range: this.range,
      fields: this.tableFields,
      order: {
        fieldName: 'title',
        direction: 1
      } 
    });
    return table;
  }

  renderRangePicker() {
    let rangePicker = new RangePicker(this.range);
    rangePicker.elem.addEventListener('rangePicker-dateChanged', (event) => {
      this.range.to = event.detail.to;
      this.range.from = event.detail.from;
      for (let component of this.components) {
        component.setRange(this.range);
      }
    });
    return rangePicker;
  }

  renderCharts() {
    let ordersChart = new ColumnChart({
      url: 'https://course-js.javascript.ru/api/dashboard/orders',
      height: 200,
      range: this.range,
      name:   'orders',
      title: "Total orders",
      link: '/orders',
      formatHeading: data => Object.values(data).reduce((a, b) => a + b, 0),
      formatTooltip: (date, value) => `${date.toLocaleDateString()}<br/>${value}`
    });

    let salesChart = new ColumnChart({
      url: 'https://course-js.javascript.ru/api/dashboard/sales',
      height: 200,
      range: this.range,
      name:   'sales',
      title: "Total orders",
      link: null,
      formatHeading: data => '$' + formatMoney(Object.values(data).reduce((a, b) => a + b, 0)),
      formatTooltip: (date, value) => `${date.toLocaleDateString()}<br/>$${formatMoney(value)}`
    });

    let customersChart = new ColumnChart({
      url: 'https://course-js.javascript.ru/api/dashboard/customers',
      height: 200,
      range: this.range,
      name:   'customers',
      title: "Total customers",
      link: null,
      formatHeading: data => Object.values(data).reduce((a, b) => a + b, 0),
      formatTooltip: (date, value) => `${date.toLocaleDateString()}<br/>${value}`
    });
    return [ordersChart, salesChart, customersChart];
  }
}


