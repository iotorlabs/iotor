"use strict";

var assert = require('chai').assert;
var Arduino = require('..').Arduino;
var Settings = require('../lib/arduino/settings');

describe('arduino', function () {

  it('#Settings.load', function () {
    var arduino = new Arduino();
    arduino.select('arduino:avr:diecimila:cpu=atmega168');

    assert.equal(arduino.board.id, 'diecimila');
    assert.notOk(arduino.context.get('serial.port'));

    Settings.load(arduino, {
      board: 'arduino:avr:uno',
      port: 'tty.usbmodem'
    });
    assert.equal(arduino.board.id, 'uno');
    assert.equal(arduino.context.get('serial.port'), 'tty.usbmodem');
  });

  it('#Settings.dump', function () {
    var arduino = new Arduino();
    arduino.select('arduino:avr:diecimila:cpu=atmega168');
    arduino.context.set('serial.port', 'tty.usbmodem');

    var data = {name: 'hello'};
    Settings.dump(arduino, data);
    assert.deepEqual(data, {
      name: 'hello',
      board: 'arduino:avr:diecimila',
      options: {
        cpu: 'atmega168'
      },
      port: 'tty.usbmodem'
    });
  });

});
