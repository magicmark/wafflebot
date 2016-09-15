'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _command = require('./command.js');

var _command2 = _interopRequireDefault(_command);

var _message = require('./message.js');

var _message2 = _interopRequireDefault(_message);

var _mailer = require('./mailer.js');

var _mailer2 = _interopRequireDefault(_mailer);

var _action_handler = require('./action_handler.js');

var _action_handler2 = _interopRequireDefault(_action_handler);

var _lentildi = require('lentildi');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MessageHandler = function (_LentilBase) {
    _inherits(MessageHandler, _LentilBase);

    function MessageHandler() {
        _classCallCheck(this, MessageHandler);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(MessageHandler).apply(this, arguments));
    }

    _createClass(MessageHandler, [{
        key: '_handleMessage',
        value: function _handleMessage(message) {
            if (message.hasPrefix) {
                if (message.command === _command2.default.NOTIFY) {
                    this.actions.notifications(message);
                    return;
                }

                if (message.command === _command2.default.JOIN && message.parts[1]) {
                    this.actions.joinRoom(message);
                    return;
                }
            }

            if (message.command === _command2.default.FIGHT && message.parts[1] === 'marley') {
                this.actions.fightMarley(message);
                return;
            }

            if (message.command === _command2.default.MEME && message.parts[1] === 'me') {
                this.actions.makeMeme(message);
                return;
            }

            this.actions.handleOther(message);
        }
    }, {
        key: 'message',
        value: function message(author, channel, body) {
            var message = new this.Message({
                body: body,
                author: author,
                channel: channel
            });

            this._handleMessage(message);
        }
    }, {
        key: 'pm',
        value: function pm(author, body) {
            var message = new this.Message({
                body: body,
                author: author,
                channel: null
            });

            this._handleMessage(message);
        }
    }], [{
        key: 'lentilDeps',
        value: function lentilDeps() {
            return {
                logger: _lentildi.LentilDep.Provided('logger'),
                client: _lentildi.LentilDep.Provided('client'),
                mailer: _mailer2.default,
                watchlist: {},
                actions: _action_handler2.default,
                Message: _message2.default
            };
        }
    }]);

    return MessageHandler;
}(_lentildi.LentilBase);

exports.default = MessageHandler;