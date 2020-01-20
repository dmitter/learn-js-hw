import createElement from "../../lib/createElement.js";

export default class SortableList {
  constructor(renderItemHTML, items) {
    this.items = items;
    this.renderItemHTML = renderItemHTML;
    this._render();
    this.placeholder = createElement(`<div class="sortable-list__placeholder"></div>`);
    document.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('click', this._onMouseClick);
  }

  addItem(item) {
    let liElem = createElement(this.renderItemHTML(item));
    this.elem.append(liElem);
  }

  async _render() {
    let html = `<ul class="sortable-list">`;
    for (let item of this.items) {
      html += this.renderItemHTML(item);
    }
    html += `</ul>`;
    this.elem = createElement(html);
  }

  _onMouseClick = (event) => {
    if (!event.target.dataset.hasOwnProperty('deleteHandle')) return;
    let itemElem = event.target.closest('.sortable-list__item');
    itemElem.remove();
  }

  _onMouseDown = (event) => {
    let grabHandle = event.target.closest('[data-grab-handle]');
    if (!grabHandle) return;

    event.preventDefault();

    grabHandle.addEventListener('dragstart', () => false);

    this.dragElement = grabHandle.closest('.sortable-list__item');

    this._startDrag(event.clientX, event.clientY);
  }

  _startDrag(clientX, clientY) {
    if (this.isDragging) {
      return;
    }

    this.isDragging = true;

    document.addEventListener('mousemove', this._onMouseMove);
    this.dragElement.addEventListener('mouseup', this._onMouseUp);

    this.shiftX = clientX - this.dragElement.getBoundingClientRect().left;
    this.shiftY = clientY - this.dragElement.getBoundingClientRect().top;

    this._togglePlacehodler();

    this._moveAt(clientX, clientY);
  }

  _finishDrag() {
    if (!this.isDragging) {
      return;
    }

    this.isDragging = false;

    this._togglePlacehodler();
    this.dragElement.style.top = null;
    this.dragElement.style.left = null;

    document.removeEventListener('mousemove', this._onMouseMove);
    this.dragElement.removeEventListener('mouseup', this._onMouseUp);
    this.dragElement = null;
  }

  _togglePlacehodler() {
    if (this.isDragging) {
      let elementWidth = this.dragElement.offsetWidth;
      let elementHeight = this.dragElement.offsetHeight;
      this.dragElement.replaceWith(this.placeholder);
      this.placeholder.style.width = elementWidth + 'px';
      this.placeholder.style.height = elementHeight + 'px';
      this.elem.append(this.dragElement);
      this.dragElement.classList.toggle('sortable-list__item_dragging');
      this.dragElement.style.width = elementWidth + 'px';
      this.dragElement.style.height = elementHeight + 'px';
    } else {
      this.dragElement.style.width = null;
      this.dragElement.style.height = null;
      this.dragElement.classList.toggle('sortable-list__item_dragging');
      this.placeholder.replaceWith(this.dragElement);
    }
  }

  _onMouseUp = (event) => {
    this._finishDrag();
  }

  _onMouseMove = (event) => {
    this._moveAt(event.clientX, event.clientY);
    this._movePlaceholder(event.clientY);
  }

  _movePlaceholder(clientY) {
    for (let liElem of this.elem.children) {
      if (liElem.tagName != 'LI' || liElem == this.dragElement) continue;
      let liBounds = liElem.getBoundingClientRect();
      if (clientY >= liBounds.top && event.clientY <= liBounds.top + liBounds.height) {
        let elementUnder = liElem.querySelector('input[name="source"]').value;
        if (this.elementUnder != elementUnder) {
          this.elementUnder = elementUnder;
          console.log(elementUnder);
        }
        if (event.clientY > liBounds.top + liBounds.height / 2) {
          if (liElem.nextElementSibling != this.placeholder) {
            liElem.after(this.placeholder);
          }
        } else {
          if (liElem.previousElementSibling != this.placeholder) {
            liElem.before(this.placeholder);
          }
        }
      }
    }
  }

  _moveAt(clientX, clientY) {
    // new window-relative coordinates
    let newX = clientX - this.shiftX;
    let newY = clientY - this.shiftY; 

    // check if the new coordinates are below the bottom window edge
    let newBottom = newY + this.dragElement.offsetHeight; // new bottom

    // below the window? let's scroll the page
    if (newBottom > document.documentElement.clientHeight) {
      // window-relative coordinate of document end
      let docBottom = document.documentElement.getBoundingClientRect().bottom;

      // scroll the document down by 10px has a problem
      // it can scroll beyond the end of the document
      // Math.min(how much left to the end, 10)
      let scrollY = Math.min(docBottom - newBottom, 10);

      // calculations are imprecise, there may be rounding errors that lead to scrolling up
      // that should be impossible, fix that here
      if (scrollY < 0) scrollY = 0;

      window.scrollBy(0, scrollY);

      // a swift mouse move make put the cursor beyond the document end
      // if that happens -
      // limit the new Y by the maximally possible (right at the bottom of the document)
      newY = Math.min(newY, document.documentElement.clientHeight - this.dragElement.offsetHeight);
    }

    // check if the new coordinates are above the top window edge (similar logic)
    if (newY < 0) {
      // scroll up
      let scrollY = Math.min(-newY, 10);
      if (scrollY < 0) scrollY = 0; // check precision errors

      window.scrollBy(0, -scrollY);
      // a swift mouse move can put the cursor beyond the document start
      newY = Math.max(newY, 0); // newY may not be below 0
    }


    // limit the new X within the window boundaries
    // there's no scroll here so it's simple
    if (newX < 0) newX = 0;
    if (newX > document.documentElement.clientWidth - this.dragElement.offsetWidth) {
      newX = document.documentElement.clientWidth - this.dragElement.offsetWidth;
    }

    this.dragElement.style.left = newX + 'px';
    this.dragElement.style.top = newY + 'px';
  }
}