"use strict";

const router = require('../lib/router');

const HostMenu = {
  message: 'Select A Sub',
  choices: [
    ['Sub', function () {
      return SubMenu;
    }]
  ]
};

const SubMenu = {
  message: 'Select An action',
  choices: [
    ['Say Hello', function () {
      console.log('Hello');
    }]
  ]
};

function Home() {
  return {
    message: 'Home',
    choices: [
      ['Host', HostMenu]
    ]
  };
}

router(Home)
  .then(function () {
    console.log('bye');
  })
  .catch(function (err) {
    console.log(err.stack);
  });
