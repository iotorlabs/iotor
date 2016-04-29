"use strict";

var co = require('co');
var ide = require('../arduino/ide');

var detect = co.wrap(function*(argv, options, cli) {
  cli.insight.track('ano', 'detect');

  if (!ide.sdkpath) {
    return console.error('Arduino not found, please install first');
  }

  console.log('Arduino v%s (%s)', ide.version, ide.sdkpath);

});

detect.describe = ['detect', 'Detect Arduino ide'];
detect.options = {
};

module.exports = detect;
