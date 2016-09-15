'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _command = require('./command.js');

var _command2 = _interopRequireDefault(_command);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BODY_REGEX = /^\s*wafflebot\s*:?\s*/i;
var COMMAND_MAP = {
    notify: _command2.default.NOTIFY,
    join: _command2.default.JOIN,
    meme: _command2.default.MEME,
    fight: _command2.default.FIGHT
};

var Message = function () {
    function Message(_ref) {
        var body = _ref.body;
        var author = _ref.author;
        var channel = _ref.channel;

        _classCallCheck(this, Message);

        this._body = body;

        if (!body) {
            this._body = '';
        }

        this.author = author;

        if (channel) {
            this.channel = channel;
            this.isPrivateMessage = false;
        } else {
            this.isPrivateMessage = true;
        }
    }

    _createClass(Message, [{
        key: 'body',
        get: function get() {
            var messageBody = this._body.replace(BODY_REGEX, '');

            messageBody = messageBody.trim().replace(/(\s){2,}/g, ' ').toLowerCase();

            return messageBody;
        }
    }, {
        key: 'parts',
        get: function get() {
            return this.body.split(' ');
        }
    }, {
        key: 'hasPrefix',
        get: function get() {
            return BODY_REGEX.test(this._body);
        }
    }, {
        key: 'rawBody',
        get: function get() {
            return this._body;
        }
    }, {
        key: 'command',
        get: function get() {
            var mappedCommand = COMMAND_MAP[this.parts[0]];
            if (mappedCommand) {
                return mappedCommand;
            }

            return _command2.default.DEFAULT;
        }
    }]);

    return Message;
}();

exports.default = Message;