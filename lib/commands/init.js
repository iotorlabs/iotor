"use strict";

var co = require('co');
var path = require('path');
var chalk = require('chalk');
var ploper = require('ploper');
var Arduino = require('../').Arduino;

var init = co.wrap(function*(argv, options) {
  var output = options.output || process.cwd();
  var name = options.name || path.basename(output);
  var arduino = new Arduino({loadArduinoPrefs: true});

  var plop = ploper.plop(path.resolve(__dirname, '../../generators/plopfile'), output, {name: name, arduino: arduino});

  var result = yield plop.prompt(chalk.blue.bold('[ANO]') + ' What kind of project you want to create?')
    .then(plop.run)
    .then(plop.report)
    .catch(function (err) {
      console.error('[ERROR]'.red, err.message, err.stack);
      process.exit(1);
    });


  // var answer = yield inquirer.prompt({
  //   message: 'What kind of project you want to create?',
  //   type: 'list',
  //   choices: _.map(init.options.type.choices, function (choice) {
  //     return [choice, choice]
  //   })
  // });


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
