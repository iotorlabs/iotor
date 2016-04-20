"use strict";

var regex = /"([^"]+)"|([^ ]+)/g;

console.log('{build.path}/{archive_file}'.replace(regex, function (str, m) {
  return '${' + m.replace(/\./g, '_').toUpperCase() + '}';
}));
