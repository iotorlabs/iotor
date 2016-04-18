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

exports.template = function (name) {
  return Handlebars.compile(fs.readFileSync(path.resolve(__dirname, 'templates', name + '.hbs')).toString(), {
    noEscape: true
  });
};

exports.parseCompilerCmd = function (cmd) {
  var regex = /"([^"]+)"|([^ ]+)/g;
  var args = [], found;
  while (found = regex.exec(cmd)) {
    args.push(found[1] || found[2]);
  }

  regex = exports.createInterpolateRegex({global: false});
  var argv = {cmd: '', flags: [], targets: []}, last;
  _.forEach(args, function (arg) {
    if (arg.indexOf('-') === 0) {
      if (arg === '-o' || arg === '-c') { // ignore un-interpolated flag and -o
        console.warn('[PARSE_COMPILER_CMD] Flag `%s` has been ignored', arg);
      } else {
        if (regex.test(arg)) {
          // console.warn('[PARSE_COMPILER_CMD] Flag `%s` include un-interpolated variable, ignored', arg);
          arg = arg.replace(regex, function (str, m) {
            return '${' + m.replace(/\./g, '_').toUpperCase() + '}';
          });
        }
        argv.flags.push(arg);
      }
    } else if (!argv.flags.length && !argv.cmd) {
      argv.cmd = arg;
    } else if (last !== '-o') {
      argv.targets.push(arg);
    }
    last = arg;
  });
  argv.flags = argv.flags.join(' ');
  return argv;
};

exports.createInterpolateRegex = function (opts) {
  var regex,
    lDel,
    rDel,
    delLen,
    lDelLen,
    delimiter,
    g,
  // For escaping strings to go in regex
    regexEscape = /([$\^\\\/()|?+*\[\]{}.\-])/g;

  opts = opts || {};

  g = opts.global !== false;
  delimiter = opts.delimiter || '{}';
  delLen = delimiter.length;
  lDelLen = Math.ceil(delLen / 2);
  // escape delimiters for regex
  lDel = delimiter.substr(0, lDelLen).replace(regexEscape, "\\$1");
  rDel = delimiter.substr(lDelLen, delLen).replace(regexEscape, "\\$1") || lDel;

  // construct the new regex
  regex = new RegExp(lDel + "([^" + lDel + rDel + "]+)" + rDel, g ? "g" : "");
  regex.delen = lDelLen;
  return regex;
};
