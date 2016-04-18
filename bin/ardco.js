#!/usr/bin/env node

var co = require('co');

co(function *() {
  yield require('../lib/cli').cli().run();
}).catch(function (err) {
  console.error(err);
  console.error(err.stack);
  process.exit(1);
});
