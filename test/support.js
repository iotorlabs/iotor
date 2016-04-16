"use strict";

var path = require('path');
var slice = Array.prototype.slice;

exports.fixtures = function () {
  return path.resolve.apply(path, [__dirname, 'fixtures'].concat(slice.call(arguments)));
};
