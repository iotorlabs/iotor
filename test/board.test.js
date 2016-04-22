"use strict";

var assert = require('chai').assert;
var _ = require('lodash');
var Arduino = require('..').Arduino;

describe('arduino', function () {

  it('should get selection ids', function () {
    var arduino = new Arduino();
    var board = arduino.findBoard('arduino:avr:diecimila');
    var ids = board.getSelectionIds('cpu');
    assert.deepEqual(ids, ['atmega328', 'atmega168']);
  });

});
