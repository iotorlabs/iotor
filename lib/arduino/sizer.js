"use strict";

var _ = require('lodash');
var exec = require('child_process').execSync;

exports.size = function (prefs) {
  if (!prefs['recipe_size_argv_cmd']) {
    console.log('No recipe.size defined in platform. Ignore size.');
    return;
  }

  var cmd = prefs['recipe_size_argv_cmd'];
  if (prefs['recipe_size_argv_flags']) {
    cmd += ' ' + prefs['recipe_size_argv_flags'];
  }

  var regtext = prefs['recipe_size_regex'];
  if (regtext) {
    regtext = new RegExp(regtext);
  }
  var regdata = prefs['recipe_size_regex_data'];
  if (regdata) {
    regdata = new RegExp(regdata);
  }
  var regeeprom = prefs['recipe_size_regex_eeprom'];
  if (regeeprom) {
    regeeprom = new RegExp(regeeprom);
  }

  var textmax = prefs['upload_maximum_size'];
  textmax = textmax ? parseInt(textmax) : 0;
  var datamax = prefs['upload_maximum_data_size'];
  datamax = datamax ? parseInt(datamax) : 0;

  var result = exec(cmd);
  if (!result) return;
  result = result.toString();

  var lines = result.split('\n').map(_.trim).filter(_.identity);

  var matched, stext = 0, sdata = 0, seeprom = 0;
  _.forEach(lines, function (line) {
    if (regtext) {
      stext = stext < 0 ? 0 : stext;
      matched = regtext.exec(line);
      if (matched) {
        stext += parseInt(matched[1]);
      }
    }

    if (regdata) {
      sdata = sdata < 0 ? 0 : sdata;
      matched = regdata.exec(line);
      if (matched) {
        sdata += parseInt(matched[1]);
      }
    }

    if (regeeprom) {
      seeprom = seeprom < 0 ? 0 : seeprom;
      matched = regeeprom.exec(line);
      if (matched) {
        seeprom += parseInt(matched[1]);
      }
    }
  });

  return {
    text: stext,
    data: sdata,
    eeprom: seeprom,
    textmax: textmax,
    datamax: datamax
  };
};
