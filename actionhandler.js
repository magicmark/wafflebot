 "use strict";

var stock_responses = require('./responses');
var file_actions = require('./file_actions');

function ActionHandler (client, watchlist) {
  this.client    = client;
  this.watchlist = watchlist;
}

var room_guard = function (requester, room) {
  if (room) return true;

  this.client.say(requester, 'You need to be in a room to do this!');
  return false;
};



ActionHandler.prototype.join_room = function (requester, channelToJoin) {
  if (channelToJoin.charAt(0) !== '#') {
    this.client.say(requester, 'I cannot join ' + channelToJoin);
    return ;
  }

  /* Join on IRC */
  this.client.join(channelToJoin);

  /* Make it permanent */
  var me = this;
  file_actions.add_room(channelToJoin).then(function () {
    me.client.say(requester, 'I have joined ' + channelToJoin + '!');
  }, function () {
    me.client.say(requester, 'There was a potential problem permanently joining ' + channelToJoin);    
  });

};


ActionHandler.prototype.fight_marley = function (requester, room) {

  if (!room_guard.call(this, requester, room)) return ;

  this.client.action(room, 'Commencing battle...');

  setTimeout(function (me) {
      me.client.say(room, 'marley i feel the need');
  }, 1250, this);
  setTimeout(function (me) {
      me.client.say(room, 'marley come on and slam');
  }, 2320, this);

};


ActionHandler.prototype.handle_other = function (requester, message, room) {
  var response = stock_responses[message];
  if (!response) return ;

  if (response.room_guard) {
    if (!room_guard.call(this, requester, room)) return ;
  }

  response = response.message.replace('{from}', requester);

  if (room) {
    this.client.say(room, response);
  } else {
    this.client.say(requester, response);
  }

};


ActionHandler.prototype.notifications = function (requester, message, room) {

  // TODO: Consider moving this into watchlist

  // TODO: Set up the reverse of room_guard or refactor or something
  if (room) {
    this.client.say(room, requester + ': private message me to set up notifications :)');
    return ;
  }
  
  var msg_parts = message.split(' ');
  var email     = msg_parts[2];

  if (msg_parts[1] === 'subscribe' && email) {

    var me = this;
    this.watchlist.subscribe(requester, email).then(function () {
      me.client.say(requester, 'Successfully set up notifications to ' + email);
    }, function () {
      me.client.say(requester, 'There was a possible error setting up notifications. Please contact markl');
    });

  } else {
    this.client.say(requester, 'Invalid command. Usage: notify subscribe myemail@example.com');
  }

};

module.exports = ActionHandler;
