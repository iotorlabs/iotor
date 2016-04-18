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
function Context(loadArduinoPrefs) {
  if (!(this instanceof Context)) {
    return new Context(loadArduinoPrefs);
  }

  Preferences.call(this);

  if (loadArduinoPrefs) this.loadArduinoPrefs();

  this.set("runtime.ide.path", ide.sdkpath);
  this.set("runtime.ide.version", ide.version);
  this.set("runtime.os", utils.os);

  this.set("runtime.tools.arm-none-eabi-gcc.path", "{runtime.ide.path}/hardware/tools/arm/bin");

  // for teensy. just suppress error
  this.set("extra.time.local", 0);
}

util.inherits(Context, Preferences);

Context.prototype.loadArduinoPrefs = function () {
  var possibles = utils.globByOS(PREFERENCES_FILE_POSSIBLES);
  if (possibles && possibles.length) {
    this.loadFromFile(possibles[0]);
  }
};

Context.prototype.loadFromFile = function (file, persist) {
  Preferences.prototype.loadFromFile.call(this, file);
  if (persist) {
    this.file = file;
  }
};

Context.prototype.save = function () {
  if (!this.file) return;
  fs.writeFileSync(this.file, this.serialize(), 'utf8');
};

Context.prototype.serialize = function () {
  return this.reduce(function (result, value, key) {
    if (!_.startsWith(key, 'runtime.')) {
      result.push(key + '=' + value);
    }
    return result;
  }, []).join('\n');
};

module.exports = Context;
