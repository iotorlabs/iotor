"use strict";

var arduino = require('../lib/arduino');

// arduino.select('teensy:avr:teensy31');
arduino.select('Arduino_STM32:STM32F1:mapleMini');
console.log(arduino.populate(true));
