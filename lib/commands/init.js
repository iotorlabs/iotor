"use strict";

var co = require('co');
var fs = require('fs-extra');
var path = require('path');
var chalk = require('chalk');
var inquirer = require('../inquirer');
var ploper = require('ploper');
var ide = require('../arduino/ide');
var Arduino = require('../').Arduino;

var initLibraryJson = require('../command')('bin/iotlm', 'init', 'iotor-lm');

var init = co.wrap(function*(argv, options, cli) {
  cli.insight.track('iotor', 'init');

  if (!ide.sdkpath) {
    throw new Error('Arduino not found, please install first');
  }

  var output = options.output || process.cwd();
  var name = options.name || path.basename(output);
  var arduino = new Arduino({root: output, loadArduinoPrefs: true});

  //
  var type = yield inquirer.prompt({
    message: chalk.bold('What kind of project you want to create?'),
    type: 'list',
    choices: [
      ['Firmware', 'firmware'],
      ['Library', 'library']
    ]
  });

  process.chdir(output);
  var result = yield initLibraryJson(argv, options);
  process.chdir(process.cwd());

  if (!result) return;

  var data = fs.readJsonSync(path.resolve(output, 'library.json'));

  data.root = path.resolve(__dirname, '..', '..');
  data.type = type;
  data.library = type === 'library';

  var plop = ploper.plop(path.resolve(__dirname, '../../generators/plopfile'), output, {name: name, arduino: arduino});

  return yield plop.run(type, data)
    .then(plop.report)
    .catch(function (err) {
      console.error('[ERROR]'.red, err.message, err.stack);
      process.exit(1);
    });

});

init.describe = ['init [output]', 'Initialize arduino cmake project'];
init.options = {
  type: {
    alias: 't',
    describe: 'The project to create',
    choices: ['firmware', 'library', 'example']
  },
  name: {
    alias: 'n',
    describe: 'The project name. Default same as parent folder name'
  },
  board: {
    alias: 'b',
    describe: 'The board type. Example: arduino:avr:uno'
  }
};

module.exports = init;
