'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _commander2 = require('commander');

var _commander3 = _interopRequireDefault(_commander2);

var _log4js2 = require('log4js');

var _log4js3 = _interopRequireDefault(_log4js2);

var _meme = require('./lib/meme.js');

var _meme2 = _interopRequireDefault(_meme);

var _mailer = require('./lib/mailer.js');

var _mailer2 = _interopRequireDefault(_mailer);

var _message_handler = require('./lib/message_handler.js');

var _message_handler2 = _interopRequireDefault(_message_handler);

var _config_files = require('./lib/config_files.js');

var _config_files2 = _interopRequireDefault(_config_files);

var _irc_client = require('./lib/irc_client.js');

var _irc_client2 = _interopRequireDefault(_irc_client);

var _waffle = require('./static/waffle.js');

var _waffle2 = _interopRequireDefault(_waffle);

var _lentildi = require('lentildi');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Wafflebot = function () {
    function Wafflebot() {
        var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var _ref$_getIrcClient = _ref._getIrcClient;

        var _getIrcClient = _ref$_getIrcClient === undefined ? _irc_client2.default : _ref$_getIrcClient;

        var _ref$_require = _ref._require;

        var _require = _ref$_require === undefined ? require : _ref$_require;

        var _ref$_commander = _ref._commander;

        var _commander = _ref$_commander === undefined ? _commander3.default : _ref$_commander;

        var _ref$_log4js = _ref._log4js;

        var _log4js = _ref$_log4js === undefined ? _log4js3.default : _ref$_log4js;

        var _ref$_process = _ref._process;

        var _process = _ref$_process === undefined ? process : _ref$_process;

        _classCallCheck(this, Wafflebot);

        this.getIrcClient = _getIrcClient;
        this.require = _require;
        this.commander = _commander;
        this.log4js = _log4js;
        this.process = _process;

        this.config = null;
        this._setup();
    }

    _createClass(Wafflebot, [{
        key: '_setup',
        value: function _setup() {
            var version = this.require('./../package.json').version;
            this.commander.version(version).option('-d, --config-dir [optional]', 'specify config directory (Default: ~/.wafflebot)').option('-l, --log-level [optional]', 'specify log level [ALL, DEBUG, INFO, WARN, ERROR, FATAL] (Default: INFO)').option('-w, --waffle', 'prints a delicious waffle').parse(process.argv);

            if (this.commander.waffle) {
                console.log(_waffle2.default);
                this.process.exit(0);
            }

            if (!this.commander.logLevel) {
                this.commander.logLevel = 'INFO';
            }

            this.logger = this.log4js.getLogger('Wafflebot');
            this.logger.setLevel(_commander3.default.logLevel);
            this.logger.info('Initialising Wafflebot...');

            this.lentil = new _lentildi.Lentil();
            this.lentil.provide('logger', this.logger).provide('configDirectory', _commander3.default.configDir);
        }
    }, {
        key: '_wireDependencies',
        value: function _wireDependencies() {
            var client = this.getIrcClient({
                server: this.config.irc.server,
                password: this.config.irc.password,
                botname: this.config.botname
            });

            this.lentil.provide('client', client).setArgs(_meme2.default, [this.config.imgflip]).setArgs(_mailer2.default, [this.config.mail_transport_string]);

            this.lentil.create(_message_handler2.default);
        }
    }, {
        key: '_commenceWaffling',
        value: function _commenceWaffling() {
            var _this = this;

            var configFilesLoader = this.lentil.getInstance(_config_files2.default);
            var messageHandler = this.lentil.getInstance(_message_handler2.default);
            var client = this.lentil.getProvided('client');

            client.addListener('message#', messageHandler.message.bind(messageHandler));
            client.addListener('pm', messageHandler.pm.bind(messageHandler));

            client.addListener('error', function (err) {
                _this.logger.error(err);
            });

            client.connect();

            client.addListener('registered', function (err) {
                _this.logger.info('Wafflebot connected to ' + _this.config.irc.server);

                configFilesLoader.getFileJson(_config_files.JSONFiles.ROOMS).then(function (roomsJson) {
                    roomsJson.forEach(function (room) {
                        _this.logger.debug('Auto joining ' + room);
                        client.join(room);
                    });
                });
            });
        }
    }, {
        key: 'start',
        value: function start() {
            var _this2 = this;

            var configFilesLoader = this.lentil.create(_config_files2.default);

            return _bluebird2.default.resolve().then(function () {
                return configFilesLoader.directoryReady();
            }).then(function () {
                return configFilesLoader.filesReady();
            }).then(function () {
                return configFilesLoader.checkConfigFileSanity();
            }).then(function (config) {
                _this2.config = config;
            }).catch(function (err) {
                _this2.logger.fatal('Quitting.\n' + err);
                _this2.process.exit(1);
            }).then(function () {
                _this2._wireDependencies();
                _this2._commenceWaffling();
            });
        }
    }]);

    return Wafflebot;
}();

exports.default = Wafflebot;