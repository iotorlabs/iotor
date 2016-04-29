"use strict";

var co = require('co');
var menu = require('../menu');
var routes = require('../routes');
var Arduino = require('../arduino');

var config = co.wrap(function*(argv, options, cli) {
  cli.insight.track('ano', 'config');
  var arduino = new Arduino();

  var choices = co.wrap(function *() {
    var choices = [
      ['Port', routes.port(cli, arduino, updatePort)],
      ['Board', routes.board(cli, arduino, updateBoard)]
    ];

    if (arduino.board) {
      choices.push('--');
      choices = choices.concat(routes.board.options(cli, arduino, updateBoardOptions)());
    }

    return choices;
  });

  return yield menu({
    message: 'Select a settings entry:',
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

config.describe = ['config [options]', 'Change User Settings includes "board", "port" and "board menu options".'];
config.options = {
  file: {
    alias: 'f',
    describe: 'The user settings file. Default is `.anous`'
  }
};

module.exports = config;
