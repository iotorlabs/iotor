#!/usr/bin/env node

var co = require('co');

co(function *() {
  yield require('../lib/cli').cli().run();
}).then(function () {
  process.exit(0);
}).catch(function (err) {
  console.error(err.stack);
  process.exit(1);
});
