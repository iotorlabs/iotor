'use strict';

var assert = require('assert');
var _ = require('lodash');
var co = require('co');
var fs = require('fs');
var path = require('path');
var yargs = require('yargs');
var util = require('util');
var needs = require('needs');

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
}

Cli.cli = Cli;

Cli.prototype.run = co.wrap(function* (argv) {
  var that = this;

  if (process.env.NPOS_ALIAS) {
    process.argv[1] = process.env.NPOS_ALIAS;
  }

  argv = argv || process.argv.slice(2);

  yargs(argv)
    .usage("$0 <command> [options]")
    .version(function () {
      return require('./version')();
    })
    .alias('V', 'version')
    .help('h')
    .alias('h', 'help');


  _.forEach(this.commands, function (action, name) {
    var description = '';
    if (Array.isArray(action.describe)) {
      name = action.describe[0];
      description = action.describe[1] || '';
    } else if (_.isString(action.describe)) {
      description = action.describe;
    }

    // yargs.command(name, description, that.transformOptions(action.options), function (options) {
    //   process.env.ARDCO_COMMAND = name;
    //   Promise.resolve(action(argv.slice(1), options, that)).catch(done);
    // });

    yargs.command(name, description, that.transformOptions(action.options));

  });

  var options = yargs.argv;
  var command = options._[0];
  var action = this.commands[command];
  return yield action(argv.slice(1), options);

});

Cli.prototype.transformOptions = function (options) {
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
};

module.exports = Cli;
