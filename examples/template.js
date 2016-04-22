"use strict";

var util = require('util');
var Arduino = require('../lib/arduino/arduino');
var templates = require('../lib/templates');

var arduino = new Arduino();
arduino.select('teensy:avr:teensy31');
// arduino.select('Arduino_STM32:STM32F1:mapleMini');
console.log(templates.toolchain(arduino.populate()));
