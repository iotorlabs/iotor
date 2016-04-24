var actions = require('./actions');

function Menu() {
  this.history = [];
}

Menu.prototype.next = function(action, component) {
  if (action === actions.HOME) {
    while (this.history.length > 1) this.history.pop();
    component = this.history[this.history.length - 1];
  } else if (action === actions.REPLACE) {
    component = this.history[this.history.length - 1];
  } else if (action === actions.POP) {
    this.history.pop();
    component = this.history[this.history.length - 1];
  }

  var res = (typeof component === 'function') ? component() : component;
  if (action === actions.PUSH) {
    this.history.push(res);
  }

  if (this.history.length === 0) {
    return null;
  }

  return res;
};

module.exports = Menu;
