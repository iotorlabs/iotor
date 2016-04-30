"use strict";

var _ = require('lodash');
var co = require('co');
var util = require('util');
var glob = require('glob');
var path = require('path');
var Config = require('iotor-config');

var Context = require('./context');
var ide = require('./ide');
var interpolate = require('../interpolate');
var Preferences = require('./preferences');
var Vendor = require('./vendor');
var Platform = require('./platform');
var Board = require('./board');
var Settings = require('./settings');
var Sizer = require('./sizer');

var utils = require('../utils');
var decmd = require('./decmd');

/**
 *
 * @constructor
 */
function Arduino(options) {
  if (!(this instanceof Arduino)) {
    return new Arduino(options);
  }

  if (typeof options === 'string') {
    options = {root: options};
  }

  if (typeof options === 'boolean') {
    options = {loadArduinoPrefs: options};
  }
  options = options || {};

  this.root = options.root || process.cwd();
  this.config = Config.read(this.root);

  this.pcfile = options.pcfile || 'iotor.yml';

  this.vendors = null;
  this.context = new Context();
  this.context.set('runtime.libs.path', this.config.directory);
  
  this.init(options);
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
  },
  set: function (board) {
    if (board && typeof board === 'object') {
      var context = this.context;
      context.set('board', board.id);
      context.set('target_platform', board.platform.id);
      context.set('target_package', board.vendor.id);
    }
  }
});

Arduino.prototype.init = function (options) {
  // initialize vendors/packages
  this.initVendors();

  if (options.loadArduinoPrefs) {
    this.context.loadArduinoPrefs();
  }

  this.settings = new Settings(this, path.resolve(this.root));

  this.select(options.board || this.board);
};


Arduino.prototype.initVendors = function () {
  this.vendors = _.transform(this.loadHardware(), function (vendors, vendor) {
    vendors[vendor.id] = vendor;
  }, {});
};

Arduino.prototype.getVendor = function (vendorId) {
  return this.vendors[vendorId];
};

Arduino.prototype.getPlatform = function (vendorId, platformId) {
  var vendor = this.getVendor(vendorId);
  if (vendor) {
    return vendor.platforms[platformId];
  }
};

Arduino.prototype.select = function (board) {
  if (typeof board === 'string') {
    board = board || 'arduino:avr:uno';
    var opts = _.isString(board) ? _.split(board, ':', 4)[3] : null;
    board = this.findBoard(board);
  }
  if (this.board !== board) {
    this.board = board;

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
  }

  if (this.board) {
    this.context.set("build.arch", this.platform.id);
    this.context.set("runtime.platform.path", this.platform.dir);
    this.context.set("runtime.hardware.path", path.dirname(this.platform.dir));
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

Arduino.prototype.selectBoardOptions = function (board, options) {
  var that = this;
  _.forEach(options, function (value, key) {
    if (!board.hasMenu(key)) {
      throw new Error(util.format('%s: Invalid option for board "%s"', key, board.id));
    }

    if (!board.getSelectionLabel(key, value)) {
      throw new Error(util.format('%s: Invalid option for "%s" option for board "%s"', value, key, board.id));
    }

    that.selectBoardOption(board, key, value);
  });
};

Arduino.prototype.selectBoardOption = function (board, key, value) {
  this.context.set('custom_' + key, board.id + '_' + value);
};

Arduino.prototype.getBoardOption = function (board, menuId) {
  var entry = this.context.get('custom_' + menuId);
  if (entry && _.startsWith(entry, board.id)) {
    return entry.substring(board.id.length + 1);
  }
  return board.getDefaultSelectionId(menuId);
};

Arduino.prototype.getPlatformPreferences = function () {
  var board = this.board;
  var platform = this.platform;
  if (!board || !platform) return;

  var tool = board.prefs.get('upload.tool');
  if (tool) tool = platform.tool(tool);
  if (tool) tool = tool.toObject();

  var prefs = new Preferences(platform.prefs.reduce(function (data, value, key) {
    if (!_.startsWith(key, 'tools.')) {
      data[key] = value;
    }
    return data;
  }, {}));


  if (tool) {
    tool = interpolate(tool, tool);
    _.forEach(tool, function (value, key) {
      prefs.set('tool.' + key, value);
    });
  }

  return prefs;
};

/**
 *
 * @param menuIgnore
 * @returns {Preferences}
 */
Arduino.prototype.getBoardPreferences = function (menuIgnore) {
  menuIgnore = menuIgnore !== false;
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
      extendedName += ", " + board.getSelectionLabel(menuId, selectionId);
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

Arduino.prototype.boardString = function () {
  return util.format('%s:%s:%s',
    (this.vendor && this.vendor.id) || this.context.get('target_vendor'),
    (this.platform && this.platform.id) || this.context.get('target_platform'),
    (this.board && this.board.id) || this.context.get('board')
  );
};

Arduino.prototype.populate = function (options) {
  if (typeof options === 'boolean') {
    options = {transform: options};
  }
  options = options || {};
  options.data = options.data || {};

  if (!this.context.get('board')) {
    throw new Error('Board has not been specified');
  }

  if (!this.board) {
    throw new Error('Board not found: ' + this.boardString());
  }

  var data = _.assign.apply(null, _.map([
    this.getPlatformPreferences(),
    this.getBoardPreferences(),
    this.context,
    options.data
  ], function (prefs) {
    return prefs && prefs.toObject ? prefs.toObject() : prefs;
  }));

  data = interpolate(data, data, {silent: true});
  // data = interpolate(data, data, {silent: false, uninterpolated: ''});

  return _.transform(data, function (result, value, key) {
    key = key.replace(/\./g, '_');
    result[key] = value = options.transform ? transform(value) : value;
    // decode receipt pattern only, not tools pattern
    if (_.endsWith(key, '_pattern') && value) {
      var isMakeCmd = _.startsWith(key, 'recipe') && !_.startsWith(key, 'recipe_size');
      var command = decmd(value, isMakeCmd); // intercept make command
      key = key.replace(/_pattern$/, '_argv');
      _.forEach(command, function (v, k) {
        // TODO find a better way to replace .bin to .hex for upload tools ...
        v = v.replace(/\.bin/g, '.hex');
        result[key + '_' + k] = v;
      });
    }
  }, {});
};

Arduino.prototype.size = function (path, name) {
  var prefs = path;
  if (typeof path === 'string') {
    prefs = this.populate({
      transform: false,
      data: {
        'build.path': path,
        'build.project_name': name
      }
    })
  }

  return Sizer.size(prefs);
};

function findHardwares() {
  var dirs = _.map(_.filter([ide.sdkpath, ide.sketchpath], function (p) {
    return !!p;
  }), function (p) {
    return path.join(p, 'hardware', '*', '*', 'boards.txt');
  });

  if (!dirs || !dirs.length) return;

  return _.flatten(dirs.map(findfiles)).map(path.dirname);
}

function findfiles(pattern) {
  return glob.sync(pattern);
}

function transform(text) {
  var regex = interpolate.regex();
  if (regex.test(text)) {
    text = text.replace(regex, function (str, m) {
      return '${' + m.replace(/\./g, '_').toUpperCase() + '}';
    });
  }
  return text;
}

module.exports = Arduino;
