var _ = require('lodash');
var interpolate = require('./interpolate');

module.exports = function () {

  var interceptors = [];
  interceptors.push(translate());
  interceptors.push(pick([
    '-c',                           // ignore -c
    ['-o', 1],                      // ignore -o and it's parameter
    '-Wl,-Map',                     // ignore wl map
    /^[^-]*\.(elf|bin|eep|hex)$/,   // ignore output flag
    /ARCHIVE_FILE|OBJECT_FILES/,    // ignore target files
    /INCLUDES|SOURCE_FILE/          // ignore includes and source_file
  ], 'ignore'));
  interceptors.push(wlgroup());

  return function (cmd) {
    var command = new Command(cmd);

    var flags = [];
    while (command.current()) {
      var flag = null;
      for (var i = 0; i < interceptors.length; i++) {
        if (flag = interceptors[i](command)) break;
      }
      if (!flag) {
        flag = {
          type: 'flag',
          value: command.current()
        };
        command.next();
      }
      if (flag) flags.push(flag);
    }

    return {
      cmd: command.cmd,
      flags: _.filter(flags, function (flag) {
        return flag.type === 'flag'
      }).map(function (flag) {
        return flag.value;
      }).join(' ')
    }

  }
}();

/**
 *
 * @param cmd
 * @constructor
 */
function Command(cmd) {
  var regex = /"([^"]*)"|([^ ]+)/g;
  var args = [], found;
  while (found = regex.exec(cmd)) {
    args.push(found[1] || found[2]);
  }
  this.args = args;
  this.index = 0;

  if (this.current() && this.current()[0] !== '-') {
    this.cmd = this.current();
    this.next();
  }
}

Command.prototype.current = function (newValue) {
  if (this.index >= this.args.length) return;
  if (arguments.length > 0) {
    return this.args[this.index] = newValue
  }
  return this.args[this.index];
};

Command.prototype.next = function () {
  this.index++;
  return this.current();
};

function translate() {
  var regex = interpolate.regex();
  return function (command) {
    var curr = command.current();
    regex.lastIndex = 0;
    if (regex.test(curr)) {
      // console.warn('[PARSE_COMPILER_CMD] Flag `%s` include un-interpolated variable, ignored', arg);
      curr = curr.replace(regex, function (str, m) {
        return '${' + m.replace(/\./g, '_').toUpperCase() + '}';
      });
      command.current(curr);
    }
  }
}

function pick(ignores, type) {
  type = type || 'picked';
  return function (command) {
    var curr = command.current();
    var found = _.find(ignores, function (ig) {
      var f = ig;
      if (Array.isArray(ig)) {
        f = ig[0]
      }
      if (_.isRegExp(f)) {
        return f.test(curr);
      }
      return _.startsWith(curr, f);
    });
    if (found) {
      var flag = {
        type: type,
        value: [curr]
      };
      if (Array.isArray(found)) {
        for (var i = 0; i < (found[1] || 0); i++) {
          flag.value.push(command.next());
        }
      }
      command.next();
      return flag;
    }
  }
}

function wlgroup() {
  var regstart = /-Wl,--start-group/;
  var regend = /-Wl,--end-group/;

  return function (command) {
    if (!regstart.test(command.current())) {
      return;
    }

    var flag = {
      type: 'wlgroup',
      value: [],
      raw: [command.current()]
    };

    while (command.next()) {
      var curr = command.current();
      flag.raw.push(curr);
      if (regend.test(curr)) {
        command.next();
        break;
      } else {
        flag.value.push(curr);
      }
    }
    flag.value = flag.value.join(' ');
    flag.raw = flag.raw.join(' ');
    return flag;
  }
}
