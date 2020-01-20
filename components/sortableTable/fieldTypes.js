import escapeHTML from '../../lib/escapeHTML.js'
import formatMoney from "../../lib/formatMoney.js";

export default {
  image: {
    render(url) {
      return `<img class="sortable-table__image" src="${escapeHTML(url)}">`;
    },
    compare: null
  },
  string: {
    render(text) {
      return escapeHTML(text);
    },
    compare(value1, value2) {
      return value1 > value2 ? 1 :
        value1 == value2 ? 0 : -1;
    }
  },
  currency: {
    render(text) {
      return "$" + formatMoney(escapeHTML(text));
    },
    compare(value1, value2) {
      return +value1 > +value2 ? 1 :
        value1 == value2 ? 0 : -1;
    }
  },
  number: {
    render(text) {
      return escapeHTML(text);
    },
    compare(value1, value2) {
      return +value1 > +value2 ? 1 :
        value1 == value2 ? 0 : -1;
    }
  },
  enabled: {
    render(value) {
      return value ? 'Enabled' : 'Disabled'
    },
    compare(value1, value2) {
      return +value1 > +value2 ? 1 :
        value1 == value2 ? 0 : -1;
    }
  }
};