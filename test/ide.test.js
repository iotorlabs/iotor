"use strict";

var assert = require('chai').assert;
var ide = require('../lib/ide');

describe('ide', function () {

	it('should initialize paths', function () {
    assert.ok(ide.sdkpath);
    assert.ok(ide.docpath);
    assert.ok(ide.version);
	});

});
