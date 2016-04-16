"use strict";

var _ = require('lodash');
var co = require('co');
var util = require('util');
var glob = require('glob');
var path = require('path');

var context = require('./context');
var ide = require('./ide');
var Vendor = require('./vendor');
var Platform = require('./platform');

var slice = Array.prototype.slice;

function Arduino() {
  this.vendors = null;
  this.init();
}

Object.defineProperty(Arduino.prototype, 'vendor', {
  get: function () {
    return this.getVendor(context.get('target_package'));
  }
});

Object.defineProperty(Arduino.prototype, 'platform', {
  get: function () {
    return this.getPlatform(context.get('target_package'), context.get('target_platform'));
  }
});

Object.defineProperty(Arduino.prototype, 'board', {
  get: function () {
    if (this.platform) {
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
  var vendor, platform;
  var args;
  if (arguments.length > 1) {
    args = slice.call(arguments);
  } else {
    args = _.split(board, ':', 4);
  }

  if (args.length < 3) {
    throw new Error(util.format('%s: Invalid board name, it should be of the form "vendor:arch:board" or "vendor:arch:board:options""', board));
  }

  vendor = this.getVendor(args[0]);
  if (!vendor) {
    throw new Error(util.format('%s: Unknown vendor', args[0]));
  }

  platform = vendor.platforms[args[1]];
  if (!platform) {
    throw new Error(util.format('%s: Unknown platform', args[1]));
  }

  board = platform.boards[args[2]];
  if (!board) {
    throw new Error(util.format('%s: Unknown board', args[2]));
  }

  this.selectBoard(board);

  if (args.length > 3) {
    var options = args[3].split(',');
    _.forEach(options, function (option) {
      var pair = _.split(option, '=', 2);
      if (pair.length !== 2) {
        throw new Error(util.format('%s: Invalid option, should be of the form "name=value"', option, board.id));
      }
      var key = pair[0];
      var value = pair[1];

      if (!board.hasMenu(key)) {
        throw new Error(util.format('%s: Invalid option for board "%s"', key, board.id));
      }

      if (!board.getMenuLabel(key, value)) {
        throw new Error(util.format('%s: Invalid option for "%s" option for board "%s"', value, key, board.id));
      }

      context.set('custom_' + key, board.id + '_' + value);
    });
  }

  return this;
};

Arduino.prototype.selectBoard = function (board) {
  if (!board || typeof board !== 'object') {
    throw new Error('board is invalid');
  }

  var platform = board.platform;
  var vendor = platform.vendor;

  context.set("target_package", vendor.id);
  context.set("target_platform", platform.id);
  context.set("board", board.id);

  context.set("runtime.platform.path", platform.dir);
  context.set("runtime.hardware.path", path.dirname(platform.dir));
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
