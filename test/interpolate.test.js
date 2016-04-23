"use strict";

var assert = require('chai').assert;
var interpolate = require('../lib/interpolate');

describe('interpolate', function () {

  it('should interpolate self ref', function () {
    var data = {
      foo: 'bar'
    };

    var src = {
      'a.b': '{foo}',
      'c.d': '{a.b}'
    };

    assert.deepEqual(interpolate(src, data), { 'a.b': 'bar', 'c.d': 'bar' });
  });

  it('should interpolate with uninterpolate string', function () {
    var src = {
      'x': '{y}'
    };

    assert.deepEqual(interpolate(src, {}, {
      uninterpolated: 'hello'
    }), { 'x': 'hello' });
  });

  it('should interpolate with uninterpolate function', function () {
    var src = {
      'x': '{y}'
    };

    assert.deepEqual(interpolate(src, {}, {
      uninterpolated: function (text, value) {
        return 'hello ' + value
      }
    }), { 'x': 'hello y' });
  });
});
