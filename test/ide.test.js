"use strict";

var assert = require('chai').assert;
var ide = require('../lib/arduino/ide');

describe('ide', function () {

	it('should initialize paths', function () {
    assert.ok(ide.sdkpath);
    assert.ok(ide.sketchpath);
    assert.ok(ide.version);
	});

});
