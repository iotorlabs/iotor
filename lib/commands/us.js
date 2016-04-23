"use strict";

var co = require('co');
var routes = require('../routes');
var Router = require('../router');
var Arduino = require('../arduino');

var us = co.wrap(function*(argv, options, cli) {
  var arduino = new Arduino();

  var choices = co.wrap(function *() {
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
    choices: choices
  });

  function updatePort(port) {
    arduino.context.set('serial.port', port);
    arduino.settings.save();
    return 'home';
  }

  function updateBoard(board) {
    arduino.select(board);
    arduino.settings.save();
    return 'home';
  }

  function updateBoardOptions(board, menuId, selectionId) {
    arduino.selectBoardOption(board, menuId, selectionId);
    arduino.settings.save();
    return 'home';
  }
});

us.describe = ['us [options]', 'Change User Settings includes "board", "port" and "board menu options".'];
us.options = {
  file: {
    alias: 'f',
    describe: 'The user settings file. Default is `.anous`'
  }
};

module.exports = us;
