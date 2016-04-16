"use strict";

var _ = require('lodash');
var fs = require('fs');
var Promise = require('bluebird');

var utils = require('./utils');

module.exports = Preferences;

/**
 *
 * @constructor
 */
function Preferences(props) {
  if (!(this instanceof Preferences)) {
    return new Preferences(props);
  }

  this._data = props || {};
}

Preferences.load = function (content) {
  return Preferences().load(content);
};

Preferences.loadFromFile = function (file) {
  return Preferences().loadFromFile(file);
};

Object.defineProperty(Preferences.prototype, 'data', {
  get: function () {
    return this._data;
  }
});

Preferences.prototype.loadFromFile = function (file) {
  if (!fs.existsSync(file)) return;

  this.load(fs.readFileSync(file, 'utf8'));
  return this;
};


Preferences.prototype.load = function (content) {
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

    return [key, value];
  }).reduce(function (props, parts) {
    props[parts[0]] = parts[1];
    return props;
  }, this._data);

  return this;
};

Preferences.prototype.has = function (key) {
  return key in this.data;
};

Preferences.prototype.get = function (key) {
  return this.data[key];
};

Preferences.prototype.set = function (key, value) {
  this.data[key] = value;
};

Preferences.prototype.keys = function () {
  return Object.keys(this._data);
};

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
  return new Preferences(_.pickBy(this._data, function (value, key) {
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
  var result = {};

  _.forEach(this._data, function (value, key) {
    var dot = key.indexOf('.');
    if (dot < 0) return;

    var parent = key.substring(0, dot);
    var child = key.substring(dot + 1);

    if (!result[parent]) result[parent] = new Preferences();
    result[parent].data[child] = value;
  });

  return new Preferences(result);
};

/**
 * Return a new props object using a subtree of the current mapping. Top
 * level pairs are ignored. E.g. with the following mapping:<br />
 *
 * <pre>
 * Map (
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
 * Map(
 *     some.keys = v1
 *     other.keys = v2
 *   )
 * </pre>
 *
 * @param parent
 * @return
 */
Preferences.prototype.subTree = function (parent, sublevels) {
  if (sublevels === undefined) sublevels = -1;
  parent += ".";
  var parentLen = parent.length;
  var result = {};
  _.forEach(this._data, function (value, key) {
    if (!_.startsWith(key, parent)) return;

    var newKey = key.substring(parentLen);
    var keySubLevels = newKey.split('.').length;
    if (sublevels === -1 || keySubLevels === sublevels) {
      result[newKey] = value;
    }
  });

  return new Preferences(result);
};

Preferences.prototype.remove = function (name) {
  delete this._data[name];
  return this;
};

Preferences.prototype.toJSON = function () {
  return _.transform(this._data, function (result, value, key) {
    result[key] = value && value.toJSON ? value.toJSON() : value;
  }, {});
};

Preferences.prototype.toString = function (indent) {
  indent = indent || '';
  var str = '';
  _.forEach(this._data, function (value, key) {
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
