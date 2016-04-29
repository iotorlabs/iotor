"use strict";

var _ = require('lodash');
var path = require('path');
var fs = require('fs-extra');
var glob = require('glob');

var utils = require('../utils');

var suffixes = exports.suffixes = [
  'Contents/Resources/Java/',
  'Contents/Java/'
];

var IDE_DIR_POSSIBLES = {
  macosx: [
    '/Applications/Arduino*',
    '/Developer/Applications/Arduino*',
    '/sw/arduino*',       // Fink
    '/opt/local/arduino*' //MacPorts
  ],
  linux: [
    '/usr/share/arduino*',
    '/opt/local/arduino*',
    '/opt/arduino*',
    '/usr/local/share/arduino*',
    '~/arduino*'
  ],
  windows: [
    "C:\\Program Files\\Arduino",
    "C:\\Program Files (x86)\\Arduino"
  ]
};

var version_regex = /([0-9]+)[.]([0-9]+)[.]([0-9]+)/;

function detect() {
  var sdkpath = '', version = '', version_num = '', sketchpath = '';

  // find sdk
  var file = 'lib/version.txt';
  var possibles = utils.globByOS(IDE_DIR_POSSIBLES).sort().reverse();
  var found = _.find(possibles, function (p) {
    sdkpath = p;
    if (fs.existsSync(path.join(sdkpath, file))) {
      return true; // break
    }
    return _.find(suffixes, function (suffix) {
      sdkpath = path.join(p, suffix);
      if (fs.existsSync(path.join(sdkpath, file))) {
        version = fs.readFileSync(path.join(sdkpath, file), 'utf-8');
        return true; // break
      }
    })
  });

  if (found) {
    // find sketchpath
    if (utils.isWindows()) {
      sketchpath = utils.resolve('%HOMEPATH%\\My Documents\\Arduino\\hardware');
    } else if (utils.isMacOS()) {
      sketchpath = utils.resolve('~/Documents/Arduino');
    }
  }

  var match = version_regex.exec(version);
  if (match) {
    version_num = match[1] + _.padStart(match[2], 2, 0) + _.padStart(match[3], 2, 0);
  } else {
    version_num = 0;
  }

  return {
    sdkpath: utils.excludeSlash(sdkpath),
    sketchpath: utils.excludeSlash(sketchpath),
    version: version,
    version_num: version_num
  }
}

var detected = detect();

exports.sdkpath = detected.sdkpath;
exports.sketchpath = detected.sketchpath;
exports.version = detected.version;
exports.version_num = detected.version_num;


