"use strict";

var _ = require('lodash');
var alm = require('ano-lm');

var IGNORES = ['help', 'login', 'register', 'search', 'unregister'];

exports.commands = _.transform(alm.commands, function (result, value, name) {
  if (IGNORES.indexOf(name) >= 0) return result;

  var cmd = require('./command')('bin/alm', name, 'ano-lm');
  cmd.help = false;
  result[name] = cmd;
  return result;
}, {});


