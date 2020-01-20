import fetchJson from '../../../lib/fetchJson.js'
import { FetchError } from '../../../lib/fetchJson.js'
import createElement from "../../../lib/createElement.js";
import Router from "../../../lib/router.js";
import SortableList from '../../../components/sortableList/index.js';
import { ErrorNotification, SuccessNotification } from '../../../components/notification/index.js';


const IMGUR_CLIENT_ID = "28aaa2e823b03b1";

export default class EditProductPage {

  async render() {
    let strippedPath = decodeURI(window.location.pathname)
      .replace(/^\/|\/$/, '')
      .replace(/\?.*$/, '')
      .replace(/#.*$/, '');
    this.productId = strippedPath.split('/').slice(1)[0];
    let product = (await fetchJson(`https://course-js.javascript.ru/api/rest/products?id=${this.productId}`))[0];
    this.elem = createElement(this._renderFormHTML);
    this.elems = {};
    for (let subElem of this.elem.querySelectorAll('[data-elem]')) {
      this.elems[subElem.dataset.elem] = subElem;
    }
    let form = this.elems.productForm;
    form.title.value = product.title;
    form.description.value = product.description;
    this.imageList = new SortableList(this._renderImageListItemHTML, product.images);
    this.elems.imageListContainer.append(this.imageList.elem);
    form.uploadImage.onclick = () => this._uploadImage();
    let categories = await this._fetchCategories();
    form.category.append(...categories);
    form.category.value = product.subcategory;
    form.price.value = product.price;
    form.discount.value = product.discount;
    form.quantity.value = product.quantity;
    form.status.value = product.status;
    form.addEventListener('submit', (event) => this._onSubmit(event));
    return this.elem;
  }

  _onSubmit(event) {
    event.preventDefault();
    this._save();
  }

  async _save() {
    let product = {
      id: this.productId,
      title: this.elems.productForm.title.value,
      description: this.elems.productForm.title.value,
      subcategory: this.elems.productForm.category.value,
      price: +this.elems.productForm.price.value,
      quantity: +this.elems.productForm.quantity.value,
      discount: +this.elems.productForm.discount.value,
      status: +this.elems.productForm.status.value,
      images: []
    };
    let imageLiElems = this.elems.imageListContainer.querySelectorAll('li');
    for (let liElem of imageLiElems) {
      let url = liElem.querySelector('input[name="url"]').value;
      let source = liElem.querySelector('input[name="source"]').value;
      product.images.push({ url, source });
    }
    let result = await fetchJson("https://course-js.javascript.ru/api/rest/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    });
    this.productId ? new SuccessNotification("Product saved") : (Router.instance().navigate("/products/" + result.id));
    document.addEventListener("route", function onRoute() {
      new SuccessNotification("Product created");
      document.removeEventListener("route", onRoute);
    });
  }

  async _fetchCategories() {
    let categories = await fetchJson(`https://course-js.javascript.ru/api/rest/categories`);
    let subcategories = await fetchJson(`https://course-js.javascript.ru/api/rest/subcategories`);
    return subcategories.map((subCategory) => {
      let category = categories.find((c) => c.id == subCategory.category);
      let title = `${category.title} > ${subCategory.title}`;
      let value = subCategory.id;
      return new Option(title, value);
    });
  }

  _uploadImage() {
    let input = document.createElement("input");
    input.type = "file";
    input.onchange = async () => {
      let file = input.files[0];
      if (!file) return;

      let formData = new FormData;
      formData.append("image", file);

      this.elems.productForm.uploadImage.classList.add("is-loading");
      this.elems.productForm.uploadImage.disabled = true;
      try {
        let response = await fetchJson("https://api.imgur.com/3/image", {
          method: "POST",
          headers: { Authorization: `Client-ID ${IMGUR_CLIENT_ID}` },
          body: formData
          });
        this.imageList.addItem({ url: response.data.link, source: file.name });
      } catch (ex) {
        if (!(ex instanceof FetchError)) throw ex;
        new ErrorNotification("Upload error: " + e.message);
      } finally {
        this.elems.productForm.uploadImage.classList.remove("is-loading");
        this.elems.productForm.uploadImage.disabled = false;
      }
    };
    input.hidden = true;
    document.body.appendChild(input);
    input.click();
  }

  _renderFormHTML() {
    return `<div class="products-edit">
      <div class="content__top-panel">
        <h1 class="page-title"><a href="/products" class="link">Products</a> / Edit Product</h1>
      </div>
      <div class="content-box">
        <form data-elem="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Product name</label>
              <input required="" type="text" name="title" class="form-control" placeholder="Product name">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Description</label>
            <textarea required="" class="form-control" name="description" placeholder="Product description"></textarea>
          </div>
          <div class="form-group form-group__wide" data-elem="sortable-list-container">
            <label class="form-label">Images</label>
            <div data-elem="imageListContainer"></div>
            <button type="button" name="uploadImage" class="button-primary-outline"><span>Upload</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Category</label>
            <select class="form-control" name="category">
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Price ($)</label>
              <input required="" type="number" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Discount ($)</label>
              <input required="" type="number" name="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Quantity</label>
            <input required="" type="number" class="form-control" name="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Status</label>
            <select class="form-control" name="status">
              <option value="1">Enabled</option>
              <option value="0">Disabled</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">Save product</button>
          </div>
        </form>
      </div>
    </div>`;
  }

  _renderImageListItemHTML({ url, source }) {
    return `<li class="products-edit__imagelist-item sortable-list__item">
              <input type="hidden" name="url" value="${url}">
              <input type="hidden" name="source" value="${source}">
              <span>
                <img src="/assets/icons/icon-grab.svg" data-grab-handle alt="grab">
                <img class="sortable-table__image" alt="Image" src="${url}">
                <span>${source}</span>
              </span>
              <button type="button">
                <img src="/assets/icons/icon-trash.svg" data-delete-handle alt="delete">
              </button>
            </li>`;
  }
}