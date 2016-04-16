"use strict";

var assert = require('chai').assert;
var _ = require('lodash');
var arduino = require('../lib/arduino');

describe('arduino', function () {

  it('should select', function () {
    assert.ok(arduino.board);
  });

});
