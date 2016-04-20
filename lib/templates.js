"use strict";

var fs = require('fs');
var path = require('path');
var Handlebars = require('handlebars');

function compile(file) {
  return Handlebars.compile(fs.readFileSync(file).toString(), {
    noEscape: true
  });
}

function template(name) {
  var t = compile(path.resolve(__dirname, '..', 'templates', name + '.hbs'));
  return function (data) {
    return t(data);
  }
}

exports.toolchain = template('toolchain');
