"use strict";

var _ = require('lodash');
var util = require('util');
var utils = require('./utils');

module.exports = function (src, data, opts) {
  if (typeof opts === 'number') {
    opts = {depth: opts};
  }
  opts = opts || {};
  opts.silent = opts.silent !== false;
  var regex = utils.createInterpolateRegex(opts);
  var result = interpolateObject(src, data, regex);

  var depth = Math.min(Math.abs(opts.depth || 10), 10);
  for (var i = 0; i < depth; i++) {
    result = interpolateObject(result, result, regex);
  }

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
};

function interpolateObject(src, data, opts) {
  return _.transform(src, function (result, value, key) {
    if (typeof value === 'string') {
      value = interpolate(value, data, opts);
    }
    result[key] = value;
  }, {});
}

function interpolate(template, data, opts) {
  var regex = _.isRegExp(opts) ? opts : utils.createInterpolateRegex(opts);
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

