"use strict";

var Preferences = require('./preferences');

module.exports = Board;

/**
 *
 * @param id
 * @param prefs
 * @param platform
 * @constructor
 */
function Board(id, prefs, platform) {
  this.id = id;
  this.prefs = prefs;
  this.platform = platform;

  // Setup sub-menus
  var menus = prefs.firstLevel().get("menu");
  if (menus) {
    this.menuOptions = menus.firstLevel();
  } else {
    this.menuOptions = new Preferences();
  }

  // Auto generate build.board if not set
  if (!prefs.get("build.board")) {
    prefs.set("build.board", (parent.id + "_" + id).toUpperCase);
  }
}

Object.defineProperty(Board.prototype, 'name', {
  get: function () {
    return this.prefs.get('name');
  }
});

Board.prototype.hasMenu = function (menuId) {
  return !!this.menuOptions.get(menuId);
};

Board.prototype.getMenuLabels = function (menuId) {
  return this.menuOptions.get(menuId).topLevel();
};

Board.prototype.getMenuLabel = function (menuId, selectionId) {
  return this.getMenuLabels(menuId).get(selectionId);
};

Board.prototype.getMenuIds = function () {
  return this.menuOptions.keys();
};
Board.prototype.getMenuPreferences = function (menuId, selectionId) {
  return this.menuOptions.get(menuId).subTree(selectionId);
};



