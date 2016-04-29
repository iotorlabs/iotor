"use strict";

var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');
var Yaml = require('yamljs');

var POSSIBLES = ['./', '../', '../../', '../../../', 'etc'];

module.exports = Settings;

/**
 *
 * @param arduino
 * @param file
 * @constructor
 */
function Settings(arduino, file) {
  if (!(this instanceof Settings)) {
    return new Settings(arduino, file);
  }
  this.arduino = arduino;

  this.file = file = findFile(file);
  if (file && fs.existsSync(file)) {
    this.load(arduino, file);
  }
}

Settings.prototype.load = function () {
  var data = readYaml(this.file);
  load(this.arduino, data);
};

Settings.prototype.save = function () {
  if (!this.file) return;
  var data = fs.existsSync(this.file) ? readYaml(this.file) : {};
  writeYaml(this.file, this.dump(data));
};

Settings.prototype.dump = function (data) {
  return dump(this.arduino, data);
};

Settings.load = load;
function load(arduino, data) {
  var context = arduino.context;
  if (data.board) {
    var board = arduino.select(data.board).board;
    var options = data.options || data.menu;
    if (board && options) {
      _.forEach(options, function (value, key) {
        context.set('custom_' + key, board.id + '_' + value);
      });
    }
  }

  if (data.port) {
    if (_.startsWith(data.port, '/dev/')) data.port = data.port.substring(5);
    context.set('serial.port', data.port);
  }
}

Settings.dump = dump;
function dump(arduino, data) {
  data = data || {};
  var context = arduino.context;

  if (arduino.board) {
    var board = arduino.board;
    data.board = board.vendor.id + ':' + board.platform.id + ':' + board.id;

    _.forEach(board.getMenuIds(), function (menuId) {
      if (!board.hasMenu(menuId)) return;

      var selectionId;
      // Get "custom_[MENU_ID]" preference (for example "custom_cpu")
      var entry = context.get('custom_' + menuId);

      if (entry && _.startsWith(entry, board.id)) {
        selectionId = entry.substring(board.id.length + 1);
      }

      // If no selection id, using first selection as default
      if (!selectionId) {
        selectionId = board.getDefaultSelectionId(menuId);
      }

      if (selectionId) {
        data.options = data.options || {};
        data.options[menuId] = selectionId;
      }
    });
  }

  if (context.has('serial.port')) {
    data.port = context.get('serial.port');
  }
  return data;
}

function findFile(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  var stats = fs.lstatSync(dir);
  if (stats.isFile()) {
    return dir;
  }
  if (!stats.isDirectory()) {
    return;
  }

  var rel = _.find(POSSIBLES, function (possible) {
    return fs.existsSync(path.resolve(dir, possible, 'ano.yml'));
  });

  if (rel) {
    return path.resolve(dir, rel, 'ano.yml');
  }
}

function readYaml(file) {
  return Yaml.parse(fs.readFileSync(file).toString());
}

function writeYaml(file, data) {
  fs.writeFileSync(file, Yaml.stringify(data));
}
