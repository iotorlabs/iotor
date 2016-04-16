"use strict";

var _ = require('lodash');
var path = require('path');
var glob = require('glob');
var slice = Array.prototype.slice;

var os = process.platform;
if (os === 'darwin') os = 'macosx';
if (os === 'win32') os = 'windows';
exports.os = os;

exports.resolve = function () {
  var args = slice.call(arguments);

  for (var i = 0; i < args.length; i++) {
    args[i] = args[i].replace(/^~($|\/|\\)/, '%HOME%$1').replace(/%([^%]+)%/g, function (_, n) {
      return process.env[n];
    });
  }

  return path.resolve.apply(path, args);
};

exports.isWindows = function () {
  return os === 'windows';
};

exports.isMacOS = function () {
  return os === 'macosx';
};

exports.isLinux = function () {
  return os === 'linux';
};

exports.glob = function (paths) {
  if (!paths) return [];
  paths = Array.isArray(paths) ? paths : [paths];
  paths = paths.map(function (p) {
    return exports.resolve(p)
  });
  var pattern = paths.length === 1 ? paths[0] : '{' + paths.join(',') + '}';
  return glob.sync(pattern, {nocase: true});
};

exports.globByOS = function (possibles) {
  return exports.glob(possibles[os]);
};
