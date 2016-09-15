'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _config_files = require('./config_files.js');

var _config_files2 = _interopRequireDefault(_config_files);

var _meme = require('./meme.js');

var _meme2 = _interopRequireDefault(_meme);

var _responses = require('./responses.js');

var _responses2 = _interopRequireDefault(_responses);

var _lentildi = require('lentildi');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ActionHandler = function (_LentilBase) {
    _inherits(ActionHandler, _LentilBase);

    function ActionHandler() {
        _classCallCheck(this, ActionHandler);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(ActionHandler).apply(this, arguments));
    }

    _createClass(ActionHandler, [{
        key: '_checkRoomGuard',
        value: function _checkRoomGuard(message, response) {
            if (message.isPrivateMessage && (!response || response && response.roomGuard)) {
                this.client.say(message.author, 'You need to be in a room to do this!');
                return false;
            }

            return true;
        }
    }, {
        key: '_checkPrefixGuard',
        value: function _checkPrefixGuard(message, response) {
            if (!message.hasPrefix && (!response || response && response.requiresPrefix)) {
                return false;
            }

            return true;
        }
    }, {
        key: 'joinRoom',
        value: function joinRoom(message, channelToJoin) {
            var _this2 = this;

            if (channelToJoin.charAt(0) !== '#') {
                this.client.say(message.author, 'I cannot join ' + channelToJoin + '! (Did you mean #' + channelToJoin + '?)');
                return;
            }

            this.client.join(channelToJoin);
            this.logger.info('Joined room ' + channelToJoin);

            this.configFilesLoader.getFileJson(_config_files.JSONFiles.ROOMS).then(function (roomsJson) {
                if (roomsJson.indexOf(channelToJoin) === -1) {
                    roomsJson.push(channelToJoin);
                }

                return _this2.configFilesLoader.writeFileJson(_config_files.JSONFiles.ROOMS, roomsJson);
            }).then(function () {
                _this2.client.say(message.author, 'I have joined ' + channelToJoin + '!');
                _this2.logger.debug('Saved room ' + channelToJoin + ' to file');
            }).catch(function (err) {
                _this2.client.say(message.author, 'There was a potential problem permanently joining ' + channelToJoin);
                _this2.logger.error('Error joining room ' + channelToJoin + ' - ' + err);
            });
        }
    }, {
        key: 'fightMarley',
        value: function fightMarley(message) {
            var _this3 = this;

            if (!this._checkRoomGuard(message)) return false;

            this.client.action(message.channel, 'Commencing battle...');

            return _bluebird2.default.delay(1250).then(function () {
                _this3.client.say(message.channel, 'marley i feel the need');
            }).delay(2500).then(function () {
                _this3.client.say(message.channel, 'marley come on and slam');
            });
        }
    }, {
        key: 'handleOther',
        value: function handleOther(message) {
            var _this4 = this;

            var response = this.responses.maybeGetResponse(message);

            if (!response) {
                return false;
            }

            if (!this._checkRoomGuard(message, response)) {
                return false;
            }

            if (!this._checkPrefixGuard(message, response)) {
                return false;
            }

            return _bluebird2.default.delay(response.delay).then(function () {
                if (message.isPrivateMessage) {
                    _this4.client.say(message.author, response.body);
                } else {
                    _this4.client.say(message.channel, response.body);
                }
            });
        }
    }, {
        key: 'notifications',
        value: function notifications(message) {
            var _this5 = this;

            if (!message.isPrivateMessage) {
                var errorMessage = message.author + ': Private Message me to set up notifications :)';
                this.client.say(message.channel, errorMessage);
                return false;
            }

            var email = message.parts[2];

            if (message.parts[1] === 'subscribe' && email) {
                return this.watchlist.subscribe(message.author, email).then(function () {
                    _this5.client.say(message.author, 'Successfully set up notifications to ' + email + '!');
                }).catch(function (error) {
                    _this5.client.say(message.author, 'There was a possible error setting up notifications. Please contact markl');
                });
            }

            this.client.say(message.author, 'Invalid command. Usage: notify subscribe myemail@example.com');
        }
    }, {
        key: 'makeMeme',
        value: function makeMeme(message) {
            var _this6 = this;

            return this.meme.create(message.body).then(function (result) {
                _this6.client.say(message.channel, message.author + ': ' + result);
            });
        }
    }], [{
        key: 'lentilDeps',
        value: function lentilDeps() {
            return {
                configFilesLoader: _config_files2.default,
                client: _lentildi.LentilDep.Provided('client'),
                logger: _lentildi.LentilDep.Provided('logger'),
                watchlist: {},
                meme: _meme2.default,
                responses: _responses2.default
            };
        }
    }]);

    return ActionHandler;
}(_lentildi.LentilBase);

exports.default = ActionHandler;