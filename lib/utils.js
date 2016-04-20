"use strict";

var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var glob = require('glob');
var Handlebars = require('handlebars');
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

exports.excludeSlash = function (p) {
  if (!p || typeof p !== 'string' || !p.length) return p;
  if (_.endsWith(p, '/') || _.endsWith(p, '\\')) {
    return p.substring(0, p.length - 1);
  }
  return p;
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

exports.findFile = function (files, dirs) {
  files = Array.isArray(files) ? files : [files];
  dirs = dirs || process.cwd();
  dirs = Array.isArray(dirs) ? dirs : [dirs];

  var fpath = '';
  var found = _.find(files, function (file) {
    return _.find(dirs, function (dir) {
      return fs.existsSync(fpath = path.join(dir, file));
    });
  });

  return found ? fpath : null;
};
