"use strict";

var co = require('co');
var inquirer = require('inquirer');
var menu = require('inquirer-menu');

var init = co.wrap(function* (argv, options) {

  inquirer.prompt([/* Pass your questions in here */]).then(function (answers) {
    // Use user feedback for... whatever!!
  });
});

init.describe = ['init [options]', 'Initialize arduino cmake project'];
init.options = {};

module.exports = init;
