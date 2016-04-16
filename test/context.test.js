"use strict";

var assert = require('chai').assert;
var _ = require('lodash');
var context = require('../lib/context');

describe('context', function () {

  it('should load arduino preferences', function () {
    assert.ok(context.get('board'));
  });

  it('should serialize', function () {
    assert.ok(context.get('board'));
    assert.ok(context.get('runtime.os'));
    var content = context.serialize();
    assert.include(content, 'board=');
    assert.notInclude(content, 'runtime.');
  });

});
