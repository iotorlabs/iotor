"use strict";

var co = require('co');
var _ = require('lodash');
var inquirer = require('../inquirer');

var init = co.wrap(function* (argv, options) {

  var answer = yield inquirer.prompt({
    message: 'What kind of project you want to create?',
    type: 'list',
    choices: _.map(init.options.type.choices, function (choice) {
      return [choice, choice]
    })
  });

  

  console.log(answer);
});

init.describe = ['init [options]', 'Initialize arduino cmake project'];
init.options = {
  type: {
    alias: 't',
    describe: 'The project to create',
    choices: ['firmware', 'library', 'example']
  },
  name: {
    alias: 'n',
    describe: 'The project name. Default same as parent folder name'
  },
  board: {
    alias: 'b',
    describe: 'The board type. Example: arduino:avr:uno'
  }
};

module.exports = init;
