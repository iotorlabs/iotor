module.exports = function (plop) {
  'use strict';

  var options = plop.options || {};
  var arduino = options.arduino;
  var settings = arduino.settings;
  var name = options.name || plop.folder;

  // setGenerator creates a generator that can be run with "plop generatorName"
  plop.setGenerator('Firmware', createGenerator('Firmware Project', 'firmware'));

  function createGenerator(description, type) {
    return {
      description: description,
      prompts: [
        {
          type: 'input',
          name: 'name',
          message: 'Project name?',
          default: name,
          validate: function (value) {
            if ((/.+/).test(value)) { return true; }
            return 'name is required';
          }
        }
      ],
      actions: [
        {
          type: 'add',
          path: plop.resolve('cmake/Arduino.cmake'),
          templateFile: 'templates/cmake/Arduino.cmake'
        },
        {
          type: 'add',
          path: plop.resolve('CMakeLists.txt'),
          templateFile: 'templates/CMakeLists.txt'
        },
        {
          type: 'modify',
          path: plop.resolve('CMakeLists.txt'),
          pattern: /(@type@)/gi,
          template: type
        },
        {
          type: 'add',
          path: plop.resolve('{{name}}.cpp'),
          templateFile: 'templates/Project.cpp'
        },
        {
          type: 'add',
          path: plop.resolve(arduino.usfile),
          template: JSON.stringify(settings.dump(), null, '  ')
        }
      ]
    }
  }
};
