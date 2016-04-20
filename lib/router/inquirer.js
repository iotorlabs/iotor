var inquirer = require('inquirer');
var _ = require('lodash');
var util = require('util');

var prompt = inquirer.prompt;

inquirer.prompt = function(_params, cb) {
  if (!Array.isArray(_params) && (Array.isArray(_params.choices))) {
    var params = _.cloneDeep(_params);
    params.name = 'x';

    var choices = [];
    var _choices = {};

    _.forEach(params.choices, function(choice) {
      if (_.isUndefined(choice) || _.isNull(choice) || _.startsWith(choice, '--')) {
        choices.push(new inquirer.Separator());
        return;
      } else if (Array.isArray(choice)) {
        if (!choice.length || _.startsWith(choice[0], '--')) {
          choices.push(new inquirer.Separator(choice[1]));
          return;
        } else if (choice.length >= 2) {
          choices.push({name: choice[0], value: choice[0]});
          _choices[choice[0]] = choice[1];
          return;
        }
        // throw new Error('Invalid choice: ' + choice);
      }
      throw new Error(util.format('Invalid choice: ', choice));
    });

    params.choices = choices;
    choices = _choices;

    return prompt(params, cb).then(function(answers) {
      var res = choices[answers.x];
      return typeof res === 'function' ? res() : res;
    });
  } else {
    return prompt(_params, cb);
  }
};

module.exports = inquirer;
