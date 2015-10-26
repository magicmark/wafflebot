 "use strict";

var ActionHandler = require('./actionhandler.js');
var WatchList     = require('./watchlist.js');

function MessageHandler (client) {
  this.client = client;
  this.watchlist = new WatchList();
  // TODO: Look at refactoring this instantiation
  this.actions = new ActionHandler(client, this.watchlist);
};

/* Private method, lol */
var handle_message = function (from, message, room) {
  var command, msg_parts;

  message   = message.trim().replace(/(\s){2,}/g, ' ').toLowerCase();
  msg_parts = message.split(' ');
  command   = msg_parts[0];

  // ============================
  // Handle Commands
  // ============================
  
  if (command === 'wafflebot') {
    msg_parts.shift();
    handle_message.call(this, from, msg_parts.join(' '), room);
    return ;
  }

  if (command === 'join' && msg_parts[1]) {
    this.actions.join_room(from, msg_parts[1]);
    return ;
  }

  if (command === 'fight' && msg_parts[1] === 'marley') {
    this.actions.fight_marley(from, room);
    return ;
  }

  if (command === 'notify') {
    this.actions.notifications(from, message, room);
    return ;
  }

  // ============================
  // Handle Other Stuff
  // ============================
  
  this.actions.handle_other(from, message, room);

};


MessageHandler.prototype.message = function (from, room, message) {
  this.watchlist.check(from, room, message);
  handle_message.call(this, from, message, room);
};

MessageHandler.prototype.pm = function (from, message) {  
  handle_message.call(this, from, message, null);
};

module.exports = MessageHandler;