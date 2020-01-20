export default function createGetter(field) {
  return function (obj) {    
    field = field.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    let parts = field.split(".");
    for (let part of parts) {
      if (!obj) break;
      obj = obj[part];
    }
    return obj;
  }
}