'use strict';

var co = require('co');
var _ = require('lodash');
var Promise = require('bluebird');
var sp = Promise.promisifyAll(require('serialport'));

module.exports = function (app, arduino, handler) {
  return function () {
    app.insight.track('ano', 'board');

    var current = arduino.context.get('serial.port');
    return {
      message: 'Select a serial port:',
      default: current,
      choices: function () {
        return sp.listAsync().then(function (ports) {
          return _.map(ports, function (port) {
            var name = port.comName;
            if (_.startsWith(name, '/dev/')) {
              name = name.substring(5);
            }
            return [name, selectPort(name)];
          });
        });
      }
    }
  };

  function selectPort(port) {
    return function () {
      if (handler) {
        return handler(port)
      }
      return 'home';
    }
  }
};
