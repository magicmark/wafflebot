 "use strict";

var irc = require('irc');
var Q   = require('q');

var config = {
  userName: 'WaffleBot',
  realName: 'WaffleBot',
  port: 6697,
  // channels: ['#wafflebot', '#battleground', '#frontend', '#webcore'],
  channels: ['#battleground'],
  autoConnect: false,
  secure: true,
  sasl: false
};

var connect = function (_server, _password) {
  config.password = _password;
  return new irc.Client(_server, 'wafflebot', config);
};

module.exports = connect;
