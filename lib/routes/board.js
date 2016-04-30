'use strict';

var co = require('co');
var _ = require('lodash');

module.exports = function (app, arduino, handler) {
  return function () {
    app.insight.track('racoon', 'board');

    var current = null;
    var choices = [];

    _.forEach(arduino.vendors, function (vendor) {
      _.forEach(vendor.platforms, function (platform) {
        if (!platform.name) return;
        if (!current) current = platform.name;
        choices.push([platform.name, selectBoard(platform)]);
        if (arduino.platform === platform) {
          current = platform.name;
        }
      });
    });

    return {
      message: 'Select a platform:',
      default: current,
      choices: choices
    }
  };

  function selectBoard(platform) {
    return function () {
      var current = null;
      var choices = [];

      _.forEach(platform.boards, function (board) {
        if (!current) current = board.name;
        choices.push([board.name, function () {
          if (handler) {
            return handler(board.vendor.id + ':' + board.platform.id + ':' + board.id)
          }
          return 'home';
        }]);
        if (arduino.board === board) {
          current = board.name;
        }
      });

      return {
        message: 'Select a board:',
        default: current,
        choices: choices
      }
    }
  }
};

module.exports.options = function (app, arduino, handler) {
  app.insight.track('racoon', 'board-options');

  var board = arduino.board;

  return function () {
    var choices = [];
    _.forEach(board.getMenuLabels().toObject(), function (label, id) {
      if (!board.hasMenu(id)) return;
      choices.push([label, selectMenu(id)])
    });

    return choices;
  };

  function selectMenu(menuId) {
    return function () {
      var choices = [];
      var current = arduino.getBoardOption(board, menuId);
      console.log(current);

      _.forEach(board.getSelectionLabels(menuId).toObject(), function (label, selectionId) {
        choices.push([label, function () {
          if (handler) {
            return handler(board, menuId, selectionId);
          }
          return 'home';
        }]);
        if (selectionId === current) {
          current = label;
        }
      });

      return {
        message: 'Select a option:',
        default: current,
        choices: choices
      };
    }
  }
};
