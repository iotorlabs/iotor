"use strict";

var _ = require('lodash');
var co = require('co');
var util = require('util');
var glob = require('glob');
var path = require('path');

var Context = require('./context');
var ide = require('./ide');
var interpolate = require('./interpolate');
var Preferences = require('./Preferences');
var Vendor = require('./vendor');
var Platform = require('./platform');
var Board = require('./board');

var utils = require('./utils');

/**
 *
 * @constructor
 */
function Arduino() {
  this.vendors = null;
  this.context = new Context();
  this.init();
}

Object.defineProperty(Arduino.prototype, 'vendor', {
  get: function () {
    var context = this.context;
    return this.getVendor(context.get('target_package'));
  }
});

Object.defineProperty(Arduino.prototype, 'platform', {
  get: function () {
    var context = this.context;
    return this.getPlatform(context.get('target_package'), context.get('target_platform'));
  }
});

Object.defineProperty(Arduino.prototype, 'board', {
  get: function () {
    if (this.platform) {
      var context = this.context;
      return this.platform.boards[context.get('board')];
    }
  }
});

Arduino.prototype.init = function () {
  this.initVendors();

  // load preferences from file
};

Arduino.prototype.initVendors = function () {
  this.vendors = _.transform(this.loadHardware(), function (vendors, vendor) {
    vendors[vendor.id] = vendor;
  }, {});
};

Arduino.prototype.getVendor = function (vendorName) {
  return this.vendors[vendorName];
};

Arduino.prototype.getPlatform = function (vendorName, platformName) {
  var vendor = this.getVendor(vendorName);
  if (vendor) {
    return vendor.platforms[platformName];
  }
};

Arduino.prototype.select = function (board) {
  board = board || 'arduino:avr:uno';
  var opts = _.isString(board) ? _.split(board, ':', 4)[3] : null;

  board = this.findBoard(board);

  this.selectBoard(board);

  if (opts) {
    var options = _.transform(opts.split(','), function (options, option) {
      var pair = _.split(option, '=', 2);
      if (pair.length !== 2) {
        throw new Error(util.format('%s: Invalid option, should be of the form "name=value"', option, board.id));
      }
      options[pair[0]] = pair[1];
    }, {});

    this.selectBoardOptions(board, options);
  }

  return this;
};

Arduino.prototype.findBoard = function (board) {
  if (!board || board instanceof Board) {
    return board;
  }

  var vendor, platform;
  var parts = _.split(board, ':', 4);

  if (parts.length < 3) {
    throw new Error(util.format('%s: Invalid board name, it should be of the form "vendor:arch:board" or "vendor:arch:board:options""', board));
  }

  vendor = this.getVendor(parts[0]);
  if (!vendor) {
    throw new Error(util.format('%s: Unknown vendor', parts[0]));
  }

  platform = vendor.platforms[parts[1]];
  if (!platform) {
    throw new Error(util.format('%s: Unknown platform', parts[1]));
  }

  board = platform.boards[parts[2]];
  if (!board) {
    throw new Error(util.format('%s: Unknown board', parts[2]));
  }

  return board;
};


Arduino.prototype.selectBoard = function (board) {
  if (!board || typeof board !== 'object') {
    throw new Error('board is invalid');
  }

  var platform = board.platform;
  var vendor = platform.vendor;
  var context = this.context;

  context.set("target_package", vendor.id);
  context.set("target_platform", platform.id);
  context.set("board", board.id);

  context.set("runtime.platform.path", platform.dir);
  context.set("runtime.hardware.path", path.dirname(platform.dir));

  context.set("build.arch", platform.id);

  var options = this.getBoardPreferences(true);
  if (options.get('build.core')) {
    context.set("build.core.path", "{runtime.platform.path}/cores/" + options.get('build.core'));
  }
  if (options.get('build.variant')) {
    context.set("build.variant.path", "{runtime.platform.path}/variants/" + options.get('build.variant'));
  }
  context.set("build.system.path", "{runtime.platform.path}/" + (options.get('build.system') || 'system'));
};

Arduino.prototype.selectBoardOptions = function (board, options) {
  var context = this.context;
  _.forEach(options, function (value, key) {
    if (!board.hasMenu(key)) {
      throw new Error(util.format('%s: Invalid option for board "%s"', key, board.id));
    }

    if (!board.getMenuLabel(key, value)) {
      throw new Error(util.format('%s: Invalid option for "%s" option for board "%s"', value, key, board.id));
    }

    context.set('custom_' + key, board.id + '_' + value);
  });
};

/**
 *
 * @param menuIgnore
 * @returns {Preferences}
 */
Arduino.prototype.getBoardPreferences = function (menuIgnore) {
  var board = this.board;
  if (board == null) return null;
  var boardId = board.id;

  var prefs = new Preferences(board.prefs.reduce(function (data, value, key) {
    if (!menuIgnore || !_.startsWith(key, 'menu.')) {
      data[key] = value;
    }
    return data;
  }, {}));

  var context = this.context;
  var extendedName = prefs.get("name");
  _.forEach(board.getMenuIds(), function (menuId) {
    if (!board.hasMenu(menuId)) return;

    var selectionId;
    // Get "custom_[MENU_ID]" preference (for example "custom_cpu")
    var entry = context.get('custom_' + menuId);

    if (entry && _.startsWith(entry, boardId)) {
      selectionId = entry.substring(boardId.length + 1);
    }

    // If no selection id, using first selection as default
    if (!selectionId) {
      selectionId = board.getDefaultSelectionId(menuId);
    }

    if (selectionId) {
      prefs.addEach(board.getMenuPreferences(menuId, selectionId));

      // Update the name with the extended configuration
      extendedName += ", " + board.getMenuLabel(menuId, selectionId);
    }
  });

  prefs.set("name", extendedName);
  return prefs;
};

Arduino.prototype.loadHardware = function () {
  var dirs = findHardwares();

  var vendorDirs = _.groupBy(dirs, function (dir) {
    return path.basename(path.dirname(dir));
  });

  return _.map(vendorDirs, function (dirs, id) {
    var vendor = new Vendor(id);
    _.forEach(dirs, function (dir) {
      var platform = new Platform(path.basename(dir), dir, vendor);
      vendor.platforms[platform.id] = platform;
    });
    return vendor;
  });
};

Arduino.prototype.populate = function (flat) {
  if (!this.platform) {
    throw new Error('No board has been specified');
  }
  var context = this.context;
  var data = _.assign.apply(null, _.map([this.platform.prefs, context, this.getBoardPreferences(true)], function (prefs) {
    return prefs.toObject();
  }));

  data = interpolate(data, data);
  if (flat) return data;

  return _.transform(data, function (result, value, key) {
    _.set(result, key, value);
    if (_.endsWith(key, '.pattern')) {
      _.set(result, key.replace(/\.pattern$/, '.argv'), utils.parseCompilerCmd(value));
    }
  }, {});
};

function findHardwares() {
  var dirs = _.map(_.filter([ide.sdkpath, ide.docpath], function (p) {
    return !!p;
  }), function (p) {
    return path.join(p, 'hardware', '*', '*', 'boards.txt');
  });
  return _.map(glob.sync(util.format('{%s}', dirs.join(','))), function (f) {
    return path.dirname(f);
  });
}

module.exports = new Arduino();
module.exports.Arduino = Arduino;
