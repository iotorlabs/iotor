"use strict";

var assert = require('chai').assert;
var arduino = require('../lib/arduino');

describe('arduino', function () {

  it('should select', function () {
    var ard = new arduino.Arduino();
    ard.select('arduino:avr:diecimila:cpu=atmega168');
    assert.ok(ard.board);
  });


  it('should apply menu for default selection', function () {
    var ard = new arduino.Arduino();
    ard.select('arduino:avr:diecimila');
    var prefs = ard.getBoardPreferences();
    assert.equal(prefs.get('build.mcu'), 'atmega328p');
  });

  it('should apply menu for specified selection', function () {
    var ard = new arduino.Arduino();
    ard.select('arduino:avr:diecimila:cpu=atmega168');
    var prefs = ard.getBoardPreferences();
    assert.equal(prefs.get('build.mcu'), 'atmega168');
  });


});
