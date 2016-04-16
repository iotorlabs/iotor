"use strict";

var _ = require('lodash');

var obj = {};

_.set(obj, 'a.b', '1');
_.set(obj, 'a.b.c', '2');

console.log(obj);
