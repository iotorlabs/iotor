var _ = require('lodash');
var inquirer = require('../inquirer');
var Promise = require('bluebird');

var actions = require('./actions');
var Menu = require('./menu');

var HOME = 'home';
var BACK = 'back';
var EXIT = 'exit';

module.exports = function (rootComponent) {
  return new Promise(function (resolve, reject) {
    var menu = new Menu();

    function loop(component) {
      if (component === null) {
        return resolve();
      }

      component.type = 'list';
      component.pageSize = 30;

      if (!component._choices) {
        component._choices = component.choices;
      }
      var choices;

      if (typeof component._choices === 'function') {
        choices = component._choices();
      } else if (Array.isArray(component._choices)) {
        choices = _.cloneDeep(component._choices);
      } else {
        choices = [];
      }

      Promise.resolve(choices).then(function (choices) {
        component.choices = choices;
        component.choices.push('--');
        component.choices.push(['Go Back', function () {
          return BACK;
        }]);
        component.choices.push(['Exit!', function () {
          return EXIT;
        }]);
        component.choices.push('--');

        component.default = component.default || component.choices.default || component._choices.default;

        inquirer
          .prompt(component)
          .then(function (result) {
            return result && result.then ? result : Promise.resolve(result);
          })
          .then(function (prop) {
            var action = null;

            if (prop === EXIT) {
              return resolve();
            }

            if (prop === HOME) {
              action = actions.HOME;
            } else if (prop === BACK) {
              action = actions.POP;
            } else if (prop && (typeof prop === 'function') || (prop && prop.message && prop.choices)) {
              action = actions.PUSH;
            } else {
              action = actions.REPLACE;
            }

            loop(menu.next(action, prop));
          })
          .catch(function (err) {
            reject(err);
          });
      });
    }

    loop(menu.next(actions.PUSH, rootComponent));
  });
};
