module.exports = function (plop) {
  'use strict';

  var options = plop.options || {};
  var arduino = options.arduino;
  var settings = arduino.settings;
  var name = options.name || plop.folder;

  // setGenerator creates a generator that can be run with "plop generatorName"
  // plop.setGenerator('Firmware', createGenerator('Firmware Project', 'firmware'));

  plop.setGenerator('firmware', {
    prompts: [
    ],
    actions: [
      {
        type: 'add',
        path: plop.resolve('CMakeLists.txt'),
        templateFile: 'templates/CMakeLists.txt'
      },
      {
        type: 'add',
        path: plop.resolve(arduino.usfile),
        template: JSON.stringify(settings.dump(), null, '  ')
      },
      {
        type: 'add',
        path: plop.resolve('{{name}}.ino'),
        templateFile: 'templates/Project.ino'
      }
    ]
  });

  plop.setGenerator('library', {
    prompts: [
    ],
    actions: [
      {
        type: 'add',
        path: plop.resolve('CMakeLists.txt'),
        templateFile: 'templates/CMakeLists.txt'
      },
      {
        type: 'add',
        path: plop.resolve(arduino.usfile),
        template: JSON.stringify(settings.dump(), null, '  ')
      },
      {
        type: 'add',
        path: plop.resolve('{{name}}.h'),
        templateFile: 'templates/Library.h'
      },
      {
        type: 'add',
        path: plop.resolve('{{name}}.cpp'),
        templateFile: 'templates/Library.cpp'
      }
    ]
  });
};
