"use strict";

var co = require('co');
var fs = require('fs-extra');
var path = require('path');
var inquirer = require('inquirer');
var Arduino = require('../arduino');
var templates = require('../templates');
var utils = require('../utils');

var gen = co.wrap(function*(argv, options) {
  var arduino = new Arduino(options);
  var content = templates.toolchain(arduino.populate());

  if (options.display) {
    console.log(content);
  }

  if (options.output) {
    fs.mkdirpSync(path.dirname(options.output));
    fs.writeFileSync(options.output, content);
    console.log('Generated to ' + options.output);
  }
});

gen.describe = ['gen [options]', 'Generate toolchain according options'];
gen.options = {
  board: {
    alias: 'b',
    describe: 'Select board. Exp: vendor:arch:board:foo=xxx,bar=yyy'
  },
  port: {
    alias: 'p',
    describe: 'Serial port to upload'
  },
  ardprefs: {
    alias: 'a',
    describe: 'Using arduino preferences.txt'
  },
  output: {
    alias: 'o',
    describe: 'Write output to <file>'
  },
  display: {
    alias: 'd',
    describe: 'Display the result generated'
  }
};

module.exports = gen;
