"use strict";

var assert = require('chai').assert;
var fs = require('fs');
var s = require('./support');
var Preferences = require('../lib/preferences');

describe('Preferences', function () {

  describe('constructions', function () {
    it('should load from file', function () {
      var prefs = Preferences.loadFromFile(s.fixtures('simple.txt'));
      assert.deepEqual(prefs.toObject(), {
        'alpha': 'Alpha',
        'alpha.some.keys': 'v1',
        'alpha.other.keys': 'v2',
        'beta': 'Beta',
        'beta.some.keys': 'v3'
      })
    });

    it('should load from string', function () {
      var prefs = Preferences.load(fs.readFileSync(s.fixtures('simple.txt')), 'utf8');
      assert.deepEqual(prefs.toObject(), {
        'alpha': 'Alpha',
        'alpha.some.keys': 'v1',
        'alpha.other.keys': 'v2',
        'beta': 'Beta',
        'beta.some.keys': 'v3'
      })
    });
  });

  describe('functions', function () {

    var prefs = Preferences.loadFromFile(s.fixtures('simple.txt'));

    it('topLevel', function () {
      assert.deepEqual(prefs.topLevel().toObject(), {
        'alpha': 'Alpha',
        'beta': 'Beta'
      })
    });

    it('#firslLevel', function () {
      assert.deepEqual(prefs.firstLevel().toObject(), {
        'alpha': {
          'some.keys': 'v1',
          'other.keys': 'v2'
        },
        'beta': {
          'some.keys': 'v3'
        }
      });
    });

    it('#subTree', function () {
      assert.deepEqual(prefs.subTree('alpha').toObject(), {
        'some.keys': 'v1',
        'other.keys': 'v2'
      });
    });

    it('#toString', function () {
      assert.deepEqual(prefs.toString(),
        'alpha = Alpha\n' +
        'alpha.some.keys = v1\n' +
        'alpha.other.keys = v2\n' +
        'beta = Beta\n' +
        'beta.some.keys = v3\n'
      );
    });

    it.only('#firslLevel', function () {
      var prefs = Preferences.loadFromFile(s.fixtures('prefs.txt'));
      console.log(prefs.firstLevel().toObject());
    });

  });


});
