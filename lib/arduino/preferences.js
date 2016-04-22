"use strict";

var _ = require('lodash');
var fs = require('fs');
var util = require('util');
var Dict = require("collections/dict");

var utils = require('../utils');

module.exports = Preferences;

/**
 *
 * @constructor
 */
function Preferences(values, equals, compare, getDefault) {
  if (!(this instanceof Preferences)) {
    return new Preferences(values, equals, compare, getDefault);
  }

  Dict.call(this, values, equals, compare, getDefault);
}

util.inherits(Preferences, Dict);

Preferences.load = function (content) {
  return Preferences().load(content);
};

Preferences.loadFromFile = function (file) {
  return Preferences().loadFromFile(file);
};

Object.defineProperty(Preferences.prototype, 'data', {
  get: function () {
    throw new Error('deprecated');
  }
});

Preferences.prototype.loadFromFile = function (file) {
  if (!fs.existsSync(file)) return;

  this.load(fs.readFileSync(file, 'utf8'));
  return this;
};


Preferences.prototype.load = function (content) {
  var that = this;
  if (Buffer.isBuffer(content)) {
    content = content.toString();
  }

  _.split(_.trim(content), '\n').map(_.trim).filter(function (line) {
    return line && line.length && line[0] !== '#' && _.indexOf(line, '=') >= 0;
  }).map(function (line) {
    var equals = _.indexOf(line, '=');
    var key = line.substring(0, equals).trim();
    var value = line.substr(equals + 1).trim();

    key = processPlatformSuffix(key, '.linux', utils.isLinux());
    key = processPlatformSuffix(key, '.windows', utils.isWindows());
    key = processPlatformSuffix(key, '.macosx', utils.isMacOS());

    if (key) that.set(key, value);
  });

  return this;
};

// Preferences.prototype.has = function (key) {
//   return key in this.data;
// };
//
// Preferences.prototype.get = function (key) {
//   return this.data[key];
// };
//
// Preferences.prototype.set = function (key, value) {
//   if (key) {
//     if (arguments.length === 1 && typeof key === 'object') {
//       key = key._data ? key._data : key;
//       _.merge(this._data, key);
//     } else {
//       this._data[key] = value;
//     }
//   }
// };

// Preferences.prototype.keys = function () {
//   return Object.keys(this._data);
// };

/**
 * Return a new props object that contains all the first level pairs of the
 * current props. E.g. the following props:<br />
 *
 * <pre>
 * props (
 *     alpha = Alpha
 *     alpha.some.keys = v1
 *     alpha.other.keys = v2
 *     beta = Beta
 *     beta.some.keys = v3
 *   )
 * </pre>
 *
 * will generate the following result:
 *
 * <pre>
 * props (
 *     alpha = Alpha
 *     beta = Beta
 *   )
 * </pre>
 *
 * @return
 */
Preferences.prototype.topLevel = function () {
  return new Preferences(_.pickBy(this.toObject(), function (value, key) {
    return _.indexOf(key, '.') < 0;
  }));
};

/**
 * Return a new props object that contains all the top level pairs of the
 * current props. E.g. the following props:<br />
 *
 * <pre>
 * props (
 *     alpha = Alpha
 *     alpha.some.keys = v1
 *     alpha.other.keys = v2
 *     beta = Beta
 *     beta.some.keys = v3
 *   )
 * </pre>
 *
 * will generate the following result:
 *
 * <pre>
 * alpha = props(
 *     some.keys = v1
 *     other.keys = v2
 *   )
 * beta = props(
 *     some.keys = v3
 *   )
 * </pre>
 *
 * @return
 */
Preferences.prototype.firstLevel = function () {
  var result = new Preferences();

  this.forEach(function (value, key) {
    var dot = key.indexOf('.');
    if (dot < 0) return;

    var parent = key.substring(0, dot);
    var child = key.substring(dot + 1);

    var prefs = result.get(parent);
    if (!prefs) {
      result.set(parent, prefs = new Preferences());
    }

    prefs.set(child, value);

    if (!('first' in prefs)) {
      prefs.first = child;
    }
  });

  return result;
};

/**
 * Return a new props object using a subtree of the current mapping. Top
 * level pairs are ignored. E.g. with the following mapping:<br />
 *
 * <pre>
 * Dict (
 *     alpha = Alpha
 *     alpha.some.keys = v1
 *     alpha.other.keys = v2
 *     beta = Beta
 *     beta.some.keys = v3
 *   )
 * </pre>
 *
 * a call to subTree("alpha") will generate the following result:
 *
 * <pre>
 * Dict(
 *     some.keys = v1
 *     other.keys = v2
 *   )
 * </pre>
 *
 * @param parent
 * @param sublevels
 * @return
 */
Preferences.prototype.subTree = function (parent, sublevels) {
  if (sublevels === undefined) sublevels = -1;
  parent += ".";
  var parentLen = parent.length;
  var prefs = new Preferences();
  this.forEach(function (value, key) {
    if (!_.startsWith(key, parent)) return;

    var newKey = key.substring(parentLen);
    var keySubLevels = newKey.split('.').length;
    if (sublevels === -1 || keySubLevels === sublevels) {
      prefs.set(newKey, value);
    }
  });

  return prefs;
};

Preferences.prototype.remove = Preferences.prototype.delete;

Preferences.prototype.toObject = function () {
  var obj = Dict.prototype.toObject.call(this);
  return _.transform(obj, function (result, value, key) {
    if (value && value.toObject) {
      result[key] = value.toObject();
    }
  }, obj);
};

Preferences.prototype.toString = function (indent) {
  indent = indent || '';
  var str = '';
  this.forEach(function (value, key) {
    str += indent + key + " = " + value.toString() + "\n";
  });
  return str;
};

function processPlatformSuffix(key, suffix, isCurrentPlatform) {
  if (key == null)
    return null;
  // Key does not end with the given suffix? Process as normal
  if (!_.endsWith(key, suffix))
    return key;
  // Not the current platform? Ignore this key
  if (!isCurrentPlatform)
    return null;
  // Strip the suffix from the key
  return key.substring(0, key.length - suffix.length);
}
