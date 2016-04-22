"use strict";

var _ = require('lodash');
var util = require('util');

module.exports = interpolate;

function interpolate(src, data, opts) {
  if (typeof opts === 'number') {
    opts = {depth: opts};
  }
  opts = opts || {};
  opts.silent = opts.silent !== false;
  var uninterpolated = _.identity;
  if ('uninterpolated' in opts) {
    if (typeof opts.uninterpolated === 'function') {
      uninterpolated = opts.uninterpolated;
    } else {
      uninterpolated = function () {
        return opts.uninterpolated;
      }
    }
  }

  var regex = createRegex(opts);
  var result = interpolateObject(src, data, regex);

  var depth = Math.min(Math.abs(opts.depth || 10), 10);
  for (var i = 0; i < depth; i++) {
    result = interpolateObject(result, result, regex);
  }

  result = _.transform(result, function (obj, value, key) {
    regex.lastIndex = 0;
    if (_.isString(value) && regex.test(value)) {
      regex.lastIndex = 0;
      obj[key] = value.replace(regex, function (text, value) {
        return uninterpolated(value, text);
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }, {});

  if (!opts.silent) {
    var remains, found;
    _.forEach(result, function (value, key) {
      regex.lastIndex = 0;
      if (_.isString(value) && regex.test(value)) {
        remains = remains || {};
        regex.lastIndex = 0;
        while (found = regex.exec(value)) {
          remains[key] = remains[key] || [];
          if (remains[key].indexOf(found[0]) < 0) remains[key].push(found[0]);
        }
      }
    });

    if (remains) {
      console.log('Un-interpolated pairs: ');
      console.log(util.inspect(remains, {colors: true}));
    }
  }

  return result;
}

interpolate.regex = createRegex;

function interpolateObject(src, data, opts) {
  return _.transform(src, function (result, value, key) {
    if (typeof value === 'string') {
      value = interpolateText(value, data, opts);
    }
    result[key] = value;
  }, {});
}

function interpolateText(template, data, opts) {
  var regex = _.isRegExp(opts) ? opts : createRegex(opts);
  regex.lastIndex = 0;

  return template.replace(regex, function (placeholder) {
    var key = placeholder.slice(regex.delen, -regex.delen),
      keyParts = key.split("."),
      val,
      i = 0,
      len = keyParts.length;

    if (key in data) {
      // need to be backwards compatible with "flattened" data.
      val = data[key];
    }
    else {
      // look up the chain
      val = data;
      for (; i < len; i++) {
        if (keyParts[i] in val) {
          val = val[keyParts[i]];
        } else {
          return placeholder;
        }
      }
    }
    return val;
  });
}

function createRegex(opts) {
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
}

