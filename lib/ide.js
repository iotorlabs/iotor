"use strict";

var _ = require('lodash');
var path = require('path');
var fs = require('fs-extra');
var glob = require('glob');

var utils = require('./utils');

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
    '/usr/local/share/arduino*'
  ],
  windows: [
    "C:\\Program Files\\Arduino",
    "C:\\Program Files (x86)\\Arduino"
  ]
};

function detect() {
  var sdkpath = '', version = '', docpath = '';

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
    // find docpath
    if (utils.isWindows()) {
      docpath = utils.resolve('%HOMEPATH%\\My Documents\\Arduino\\hardware');
    } else if (utils.isMacOS()) {
      docpath = utils.resolve('~/Documents/Arduino');
    }
  }

  return {
    sdkpath: utils.excludeSlash(sdkpath),
    docpath: utils.excludeSlash(docpath),
    version: version
  }
}

var detected = detect();

exports.sdkpath = detected.sdkpath;
exports.docpath = detected.docpath;
exports.version = detected.version;


