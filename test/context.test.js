"use strict";

var assert = require('chai').assert;
var Context = require('../lib/context');

describe('context', function () {

  var context = new Context();
  context.loadArduinoPrefs();

  it('should load arduino preferences', function () {
    assert.ok(context.get('board'));
  });

  it('should serialize', function () {
    assert.ok(context.get('board'));
    assert.ok(context.get('runtime.os'));
    var content = context.serialize();
    assert.include(content, 'board=');
    assert.include(content, 'runtime.');
  });

});
