"use strict";

var co = require('co');
var inquirer = require('inquirer');
var menu = require('inquirer-menu');

var setup = co.wrap(function*(argv, options) {

  const blueMenu = {
    message: 'blue-menu',
    choices: {
      callApi: function () {
        console.log('blue-api called');
      }
    }
  };

  const redMenu = {
    message: 'red-menu',
    choices: {
      callApi: function () {
        console.log('red-api called');
      }
    }
  };

  let level = 0;

  function createMenu() {
    return {
      message: 'main-menu level ' + level,
      choices: {
        setupData: function () {
          level++;
          console.log('success');
        },
        blueMenu: blueMenu,
        redMenu: redMenu
      }
    };
  }

  yield menu(createMenu);
  console.log('bye');
});

setup.describe = ['setup [options]', 'Setup arduino boards'];
setup.options = {};

module.exports = setup;
