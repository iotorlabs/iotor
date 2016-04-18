"use strict";

var co = require('co');
var inquirer = require('inquirer');
var arduino = require('../arduino');

var make = co.wrap(function*(argv, options) {
  if (options.board) {
    arduino.select(options.board);
  }

  console.log(arduino.getBoardPreferences(true))
});

make.describe = ['make [options]', 'Make toolchain.cmake file according options'];
make.options = {
  board: {
    alias: 'b',
    describe: 'Set board options. Example: vendor:arch:board'
  }
};

module.exports = make;
