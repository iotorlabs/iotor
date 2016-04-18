"use strict";

var fs = require('fs');
var path = require('path');
var Preferences = require('./preferences');
var Board = require('./board');

module.exports = Platform;

/**
 *
 * @param name
 * @param dir
 * @param vendor
 * @constructor
 */
function Platform(name, dir, vendor) {
  if (!(this instanceof Platform)) {
    return new Platform(name, dir, vendor);
  }

  this.id = name;
  this.dir = dir;
  this.vendor = vendor;

  this.boards = {};

  this.init();
}

Platform.prototype.init = function () {
  this.loadBoards();
  this.loadPlatform();
  this.loadProgrammers();
};

Platform.prototype.loadBoards = function () {
  var prefs = Preferences.loadFromFile(path.join(this.dir, 'boards.txt'));
  var localBoardsFile = path.join(this.dir, 'boards.local.txt');
  if (fs.existsSync(localBoardsFile)) {
    prefs.loadFromFile(localBoardsFile);
  }

  var boardsPreferences = prefs.firstLevel();

  var menus = boardsPreferences.get('menu');
  if (menus) {
    this.customMenus = menus.topLevel();
  }
  boardsPreferences.remove('menu');

  var that = this;
  boardsPreferences.forEach(function(preferences, id) {
    this[id] = new Board(id, preferences, that);
    that.defaultBoard = that.defaultBoard || this[id];
  }, this.boards); // this -> this.boards
};

Platform.prototype.loadPlatform = function () {
  var prefs = this.prefs = Preferences.loadFromFile(path.join(this.dir, 'platform.txt'));
  var localPlatformFile = path.join(this.dir, 'platform.local.txt');
  if (fs.existsSync(localPlatformFile)) {
    prefs.loadFromFile(localPlatformFile);
  }
};

Platform.prototype.loadProgrammers = function () {
  var prefs = Preferences.loadFromFile(path.join(this.dir, 'programmers.txt'));
  this.programmers = prefs && prefs.firstLevel();
};

