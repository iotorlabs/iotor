#!/usr/bin/env node

var co = require('co');
var chalk = require('chalk');

co(function *() {
  yield require('../lib/cli').cli().run();
}).then(function () {
  process.exit(0);
}).catch(function (err) {
  console.error(chalk.red('[ERROR]'), err.message, err.stack);
  process.exit(1);
});
