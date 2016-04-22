"use strict";

var co = require('co');
var routes = require('../routes');
var Router = require('../router');
var Arduino = require('../arduino/arduino');

var config = co.wrap(function*(argv, options, cli) {
  var arduino = new Arduino();

  var updateChoices = co.wrap(function *() {
    var choices = [
      ['Change Port', routes.port(cli, arduino, updatePort)],
      ['Change Board', routes.board(cli, arduino, updateBoard)]
    ];

    if (arduino.board) {
      choices.push('--');
      choices = choices.concat(routes.board.options(cli, arduino, updateBoardOptions)());
    }

    return choices;
  });

  return yield Router({
    message: 'Select an action to perform:',
    choices: updateChoices
  });

  function updatePort(port) {
    arduino.context.set('serial.port', port);
    arduino.config.save();
    return 'home';
  }

  function updateBoard(board) {
    arduino.select(board);
    arduino.config.save();
    return 'home';
  }

  function updateBoardOptions(board, menuId, selectionId) {
    arduino.selectBoardOption(board, menuId, selectionId);
    arduino.config.save();
    return 'home';
  }
});

config.describe = ['config [options]', 'Configure ano project to change board or port'];
config.options = {};

module.exports = config;
