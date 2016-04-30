"use strict";

var co = require('co');
var fs = require('fs-extra');
var path = require('path');
var chalk = require('chalk');
var inquirer = require('inquirer');
var Arduino = require('../arduino');
var templates = require('../templates');
var utils = require('../utils');

var cmake = co.wrap(function*(argv, options, cli) {
  cli.insight.track('racoon', 'cmake');
  options.root = options.cwd || process.cwd();

  var arduino = new Arduino(options);
  var content = templates.toolchain(arduino.populate(true));

  if (options.display) {
    console.log(content);
  }

  if (options.output) {
    fs.mkdirpSync(path.dirname(options.output));
    fs.writeFileSync(options.output, content);
    console.log(chalk.blue.bold('[ANO]') + ' Generated', options.output);
  }
});

cmake.describe = ['cmake [cwd]', 'Generate ArduinoInfo.cmake according options'];
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
