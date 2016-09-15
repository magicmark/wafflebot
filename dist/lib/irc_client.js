'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _irc2 = require('irc');

var _irc3 = _interopRequireDefault(_irc2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = {
    port: 6697,
    autoConnect: false,
    secure: true,
    sasl: false
};

exports.default = function (_ref) {
    var server = _ref.server;
    var password = _ref.password;
    var botname = _ref.botname;
    var _ref$_irc = _ref._irc;

    var _irc = _ref$_irc === undefined ? _irc3.default : _ref$_irc;

    config.password = password;
    config.userName = botname;
    config.realName = botname;
    return new _irc.Client(server, botname, config);
};