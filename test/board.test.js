"use strict";

var assert = require('chai').assert;
var _ = require('lodash');
var arduino = require('../lib/arduino');

describe('arduino', function () {

  it('should get selection ids', function () {
    var board = arduino.findBoard('arduino:avr:diecimila');
    var ids = board.getSelectionIds('cpu');
    assert.deepEqual(ids, ['atmega328', 'atmega168']);
  });

});
