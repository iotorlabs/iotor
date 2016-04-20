"use strict";

var util = require('util');
var arduino = require('../lib/arduino');
var template = require('../lib/template');

// arduino.select('teensy:avr:teensy31');
arduino.select('Arduino_STM32:STM32F1:mapleMini');
console.log(template.toolchain(arduino.populate()));
