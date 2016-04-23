"use strict";

var co = require('co');
var fs = require('fs-extra');
var path = require('path');
var inquirer = require('inquirer');
var Arduino = require('../arduino');
var templates = require('../templates');
var utils = require('../utils');

var cmake = co.wrap(function*(argv, options) {
  var arduino = new Arduino(options);
  var content = templates.cmake(arduino.populate(true));

  if (options.display) {
    console.log(content);
  }

  if (options.output) {
    fs.mkdirpSync(path.dirname(options.output));
    fs.writeFileSync(options.output, content);
    console.log('[ANO] Generated', options.output);
  }
});

cmake.describe = ['cmake [root]', 'Generate ArduinoInfo.cmake according options'];
cmake.options = {
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
    describe: 'Display the generated cmake content'
  }
};

module.exports = cmake;
