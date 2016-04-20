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
    prefs.set("build.board", (platform.id + "_" + id).toUpperCase);
  }
}

Object.defineProperty(Board.prototype, 'name', {
  get: function () {
    return this.prefs && this.prefs.get('name');
  }
});

Board.prototype.hasMenu = function (menuId) {
  return this.menuOptions.has(menuId);
};

Board.prototype.getMenuLabels = function () {
  return this.platform.customMenus;
};

Board.prototype.getSelectionLabels = function (menuId) {
  return this.menuOptions.get(menuId).topLevel();
};

Board.prototype.getSelectionLabel = function (menuId, selectionId) {
  return this.getSelectionLabels(menuId).get(selectionId);
};

Board.prototype.getMenuIds = function () {
  return this.menuOptions.keys();
};

Board.prototype.getSelectionIds = function (menuId) {
  var menu = this.menuOptions.get(menuId);
  if (!menu) {
    throw new Error('Unknown menu: ' + menuId);
  }
  return menu.topLevel().keys();
};

Board.prototype.getDefaultSelectionId = function (menuId) {
  var menu = this.menuOptions.get(menuId);
  if (!menu) {
    throw new Error('Unknown menu: ' + menuId);
  }
  if ('first' in menu) {
    return menu.first;
  }
  return menu.topLevel().keys()[0];
};

Board.prototype.getMenuPreferences = function (menuId, selectionId) {
  return this.menuOptions.get(menuId).subTree(selectionId);
};



