module.exports = function (plop) {
  'use strict';

  var options = plop.options || {};
  var arduino = options.arduino;
  var settings = arduino.settings;
  var name = options.name || plop.folder;

  var actions = [
    {
      type: 'add',
      path: plop.resolve('.iotorrc'),
      templateFile: 'templates/.iotorrc'
    },
    {
      type: 'add',
      path: plop.resolve('.gitignore'),
      templateFile: 'templates/.gitignore'
    },
    {
      type: 'add',
      path: plop.resolve('CMakeLists.txt'),
      templateFile: 'templates/CMakeLists.txt'
    },
    {
      type: 'add',
      path: plop.resolve(arduino.pcfile),
      template: settings.exportToString()
    }
  ];

  plop.setGenerator('firmware', {
    prompts: [
    ],
    actions: [].concat(actions).concat([
      {
        type: 'add',
        path: plop.resolve('{{name}}.ino'),
        templateFile: 'templates/Project.ino'
      }
    ])
  });

  plop.setGenerator('library', {
    prompts: [
    ],
    actions: [].concat(actions).concat([
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
    ])
  });
};
