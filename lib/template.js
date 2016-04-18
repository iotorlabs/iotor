"use strict";

var utils = require('./utils');

var templates = {
  toolchain: utils.template('toolchain')
};

exports.toolchain = function (data) {
  return templates.toolchain(data);
};
