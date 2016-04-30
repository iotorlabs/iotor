"use strict";

var _ = require('lodash');

var IGNORES = ['help', 'login', 'register', 'search', 'unregister'];

exports.help = _.cloneDeep(require('iotor-lm/lib/templates/json/help.json'));
exports.help.options = _.map(exports.help.options, function (option) {
  if (option.shorthand) {
    option.shorthand = option.shorthand.replace(/^[-]+/g, '');
  }
  if (option.flag) {
    option.flag = option.flag.replace(/^[-]+/g, '');
  }
  return option;
});

exports.commands = _.transform(exports.help.commands, function (result, description, name) {
  if (IGNORES.indexOf(name) >= 0) return result;

  var cmd = require('./command')('bin/iotlm', name, 'iotor-lm');
  cmd.help = false;
  cmd.describe = description;
  result[name] = cmd;
  return result;
}, {});
