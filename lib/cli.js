'use strict';

var assert = require('assert');
var _ = require('lodash');
var co = require('co');
var fs = require('fs');
var path = require('path');
var yargs = require('yargs');
var util = require('util');
var needs = require('needs');
var Insight = require('insight');

var lm = require('./lm');
var pkg = require('../package.json');

/**
 *
 * @param options
 * @returns {Cli}
 * @constructor
 */
function Cli(options) {
  if (!(this instanceof Cli)) {
    return new Cli(options);
  }

  options = options || {};

  this.root = options.root || path.resolve(__dirname, 'commands');
  this.strict = true;
  this.usage = options.usage || 'help';
  this.fallback = options.fallback || this.usage;
  this.default = options.default || this.usage;
  this.commands = needs(__dirname, './commands');

  this.insight = new Insight({
    trackingProvider: 'yandex',
    trackingCode: '36888775',
    pkg: pkg
  });
}

Cli.cli = Cli;

Cli.prototype.run = co.wrap(function*(argv) {
  var that = this;

  if (process.env.NPOS_ALIAS) {
    process.argv[1] = process.env.NPOS_ALIAS;
  }

  argv = argv || process.argv.slice(2);

  yargs(argv)
    .usage("$0 [command] [options]")
    .version(function () {
      return require('./version')();
    })
    .alias('v', 'version')
    .alias('h', 'help');

  _.forEach(lm.help.options, function (option) {
    if (option.flag === 'version' || option.flag === 'help') return;
    yargs.option(option.flag, {
      alias: option.shorthand,
      describe: option.description
    })
  });

  var commands = _.assign({}, lm.commands, this.commands);

  _.forEach(commands, commandAppender(yargs));

  var options = yargs.argv;
  var command = options._[0];
  if (!command) {
    return yargs.showHelp();
  }
  var action = commands[command];
  if (!action) {
    console.error('Invalid command:', command);
    console.error('----');
    return yargs.showHelp();
  }
  if (action && action.help !== false && options.help) {
    return yargs.showHelp();
  }

  yield action(argv.slice(1), options, this);
});

function commandAppender(yargs) {
  return function (action, name) {
    var description = '';
    if (Array.isArray(action.describe)) {
      name = action.describe[0];
      description = action.describe[1] || '';
    } else if (_.isString(action.describe)) {
      description = action.describe;
    }

    yargs.command(name, description, transformOptions(action.options));
  };

  function transformOptions(options) {
    options = options || {};
    var result = {};
    _.forEach(options, function (spec, name) {
      spec = _.clone(spec);
      if ((typeof spec.alias === 'string') && spec.alias.length === 1) {
        // exchange alias and name
        result[spec.alias] = _.assign(spec, {alias: name});
      } else {
        result[name] = spec;
      }
    });
    return result;
  }
}

module.exports = Cli;
