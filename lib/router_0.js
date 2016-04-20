'use strict';

var co = require('co');
module.exports = Router;

/**
 * The router is in charge of handling `naco` different screens.
 * @param  {Arduino} arduino instance
 * @param  {Insight} insight instance
 * @constructor
 */
function Router(arduino, insight) {
  this.routes = {};
  this.arduino = arduino;
  this.insight = insight;
  this.last = null;
  this.history = [];
}

/**
 * Navigate to a route
 * @param  {String} name Route name
 * @param  {*}      [options]  A single argument to pass to the route handler
 */
Router.prototype.navigate = co.wrap(function*(name, options) {
  if (typeof this.routes[name] === 'function') {
    if (name !== 'back') {
      if (this.last) this.history.push(this.last);
      this.last = [name, options];
    }
    return yield this.routes[name].call(null, this, options);
  }

  throw new Error('no routes called: ' + name);
});

Router.prototype.back = co.wrap(function*() {
  var item = this.last = this.history.pop();
  if (item) {
    return yield this.routes[item[0]].call(null, this, item[1]);
  }
});

/**
 * Register a route handler
 * @param {String}   name    Name of the route
 * @param {Function} handler Route handler
 */
Router.prototype.registerRoute = function (name, handler) {
  this.routes[name] = handler;
  return this;
};
