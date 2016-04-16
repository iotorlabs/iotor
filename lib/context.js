"use strict";

var util = require('util');
var _ = require('lodash');
var fs = require('fs');
var ide = require('./ide');
var utils = require('./utils');
var Preferences = require('./preferences');

var PREFERENCES_FILE_POSSIBLES = {
  macosx: [
    '~/Library/Arduino15/preferences.txt',
    '~/Library/Arduino/preferences.txt'
  ],
  windows: [
    'c:\\Documents and Settings\\%USERNAME%\\Application Data\\Arduino15\\preferences.txt',
    'c:\\Documents and Settings\\%USERNAME%\\Application Data\\Arduino\\preferences.txt',
    'c:\\Users\\%USERNAME%\\AppData\\Roaming\\Arduino15\\preferences.txt',
    'c:\\Users\\%USERNAME%\\AppData\\Roaming\\Arduino\\preferences.txt'
  ],
  linux: [
    '~/.arduino15/preferences.txt',
    '~/.arduino/preferences.txt'
  ]
};

/**
 *
 * @returns {Context}
 * @constructor
 */
function Context() {
  if (!(this instanceof Context)) {
    return new Context();
  }

  Preferences.call(this);

  var possibles = utils.globByOS(PREFERENCES_FILE_POSSIBLES);
  if (possibles && possibles.length) {
    this.file = possibles[0];
    this.loadFromFile(possibles[0]);
  }

  this.set("runtime.ide.path", ide.sdkpath);
  this.set("runtime.ide.version", ide.version);
  this.set("runtime.os", utils.os);
}

util.inherits(Context, Preferences);

Context.prototype.save = function () {
  if (!this.file) return;
  fs.writeFileSync(this.file, this.serialize(), 'utf8');
};

Context.prototype.serialize = function () {
  return _.map(_.omitBy(this._data, function (v, k) {
    return _.startsWith(k, 'runtime.');
  }), function (v, k) {
    return k + '=' + v;
  }).join('\n');
};

module.exports = new Context();
