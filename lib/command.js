"use strict";

var co = require('co');

module.exports = function Command(command, args, npmModule) {
  if (arguments.length < 3) {
    npmModule = args;
    args = null;
  }
  args = args || [];
  if (!Array.isArray(args)) args = [args];

  return co.wrap(function*(argv, _options, loader) {
    var options = {
      env: process.env,
      stdio: 'inherit'
    };

    var resolvedCommand;
    try {
      resolvedCommand = require.resolve(npmModule + '/' + command);
    } catch (er) {
      var msg = 'Error running %s (%s), it may need installation,' +
        ' try `npm update -g racoon`.';
      loader.error(msg, command, er.message);
    }

    // Transmit full original command name to children
    options.env.BIN = 'racoon';
    options.env.CMD = options.env.BIN + ' ' + process.env.ANO_COMMAND;

    // Build a new `argv` with full path for command
    // The first argv value should be the path to the node executable
    process.argv = [process.argv[0], resolvedCommand].concat(args).concat(argv);
    return yield require('module')._load(resolvedCommand, null, true);
  });
};
