 "use strict";

var irc = require('irc');
var Q   = require('q');

// TODO: Allow other config settings here
var config = {
  port: 6697,
  autoConnect: false,
  secure: true,
  sasl: false
};

var connect = function (_server, _password, _botname) {
  config.password = _password;
  config.userName = _botname;
  config.realName = _botname;
  return new irc.Client(_server, _botname, config);
};

module.exports = connect;
