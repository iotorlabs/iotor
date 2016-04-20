"use strict";

module.exports = Vendor;

function Vendor(id) {
  if (!(this instanceof Vendor)) {
    return new Vendor(id);
  }
  this.id = id;
  this.platforms = {};
}

Object.defineProperty(Vendor.prototype, 'name', {
  get: function () {
    return this.id;
  }
});
