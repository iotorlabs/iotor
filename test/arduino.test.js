"use strict";

var assert = require('chai').assert;
var Arduino = require('../lib/arduino');

describe('arduino', function () {

  it('should select', function () {
    var arduino = new Arduino();
    arduino.select('arduino:avr:diecimila:cpu=atmega168');
    assert.ok(arduino.board);
  });


  it('should apply menu for default selection', function () {
    var arduino = new Arduino();
    arduino.select('arduino:avr:diecimila');
    var prefs = arduino.getBoardPreferences();
    assert.equal(prefs.get('build.mcu'), 'atmega328p');
  });

  it('should apply menu for specified selection', function () {
    var arduino = new Arduino();
    arduino.select('arduino:avr:diecimila:cpu=atmega168');
    var prefs = arduino.getBoardPreferences();
    assert.equal(prefs.get('build.mcu'), 'atmega168');
  });


});
