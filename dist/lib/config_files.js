'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ConfigFileMap = exports.JSONFiles = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ConfigFileMap;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lentildi = require('lentildi');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

_bluebird2.default.promisifyAll(_fs2.default);

var JSONFiles = exports.JSONFiles = {
    WATCH_USERS: Symbol('WATCH_USERS'),
    ROOMS: Symbol('ROOMS'),
    CONFIG: Symbol('CONFIG')
};

var ConfigFileMap = exports.ConfigFileMap = (_ConfigFileMap = {}, _defineProperty(_ConfigFileMap, JSONFiles.WATCH_USERS, 'watched_users.json'), _defineProperty(_ConfigFileMap, JSONFiles.ROOMS, 'rooms.json'), _defineProperty(_ConfigFileMap, JSONFiles.CONFIG, 'config.json'), _ConfigFileMap);

var ConfigFilesLoader = function (_LentilBase) {
    _inherits(ConfigFilesLoader, _LentilBase);

    _createClass(ConfigFilesLoader, null, [{
        key: 'lentilDeps',
        value: function lentilDeps() {
            return {
                logger: _lentildi.LentilDep.Provided('logger'),
                fs: _fs2.default,
                os: _os2.default,
                path: _path2.default,
                process: process
            };
        }
    }]);

    function ConfigFilesLoader(configDirectory) {
        var _Object$getPrototypeO;

        _classCallCheck(this, ConfigFilesLoader);

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(ConfigFilesLoader)).call.apply(_Object$getPrototypeO, [this].concat(args)));

        _this._configDir = configDirectory;
        _this.canCreateDir = false;
        _this.resolvedConfigDirectory = null;

        _this._parseConfigDir();
        return _this;
    }

    _createClass(ConfigFilesLoader, [{
        key: '_parseConfigDir',
        value: function _parseConfigDir() {

            if (!this._configDir) {
                this.resolvedConfigDirectory = this.path.join(this.os.homedir(), '.wafflebot');
                this.canCreateDir = true;
            } else if (!this.path.isAbsolute(this._configDir)) {
                this.resolvedConfigDirectory = this.path.join(this.process.cwd(), this._configDir);
            } else {
                this.resolvedConfigDirectory = this._configDir;
            }

            this.logger.debug('Resolved config dir as ' + this.resolvedConfigDirectory + '.');
        }
    }, {
        key: '_checkConfigDirExists',
        value: function _checkConfigDirExists() {
            var _this2 = this;

            return this.fs.statAsync(this.resolvedConfigDirectory).then(function (stats) {
                if (!stats.isDirectory()) {
                    _this2.logger.warn(_this2.resolvedConfigDirectory + ' exists, but it is not a directory.');
                    throw new Error();
                }
            });
        }
    }, {
        key: '_ensureFileExists',
        value: function _ensureFileExists(filePath, defaultContent) {
            var _this3 = this;

            var fullFilePath = this.path.join(this.resolvedConfigDirectory, filePath);

            return this.fs.statAsync(fullFilePath).then(function (stats) {
                if (!stats.isFile()) {
                    _this3.logger.warn(fullFilePath + ' is not a file. Attempting to write it.');
                    throw new Error();
                }

                _this3.logger.debug(fullFilePath + ' appears to exist; moving on');
            }).catch(function (err) {
                _this3.logger.debug('Creating ' + fullFilePath + ' with default data');
                return _this3.fs.writeFileAsync(fullFilePath, defaultContent);
            }).catch(function (err) {
                throw new Error('Could not write to ' + fullFilePath + ' - ' + err);
            });
        }
    }, {
        key: 'getFileJson',
        value: function getFileJson(jsonFile) {
            var fullFilePath = this.path.join(this.resolvedConfigDirectory, ConfigFileMap[jsonFile]);

            this.logger.debug('Reading ' + fullFilePath);
            return this.fs.readFileAsync(fullFilePath, 'utf8').then(function (fileData) {
                return JSON.parse(fileData);
            });
        }
    }, {
        key: 'writeFileJson',
        value: function writeFileJson(jsonFile, jsonData) {
            var fullFilePath = this.path.join(this.resolvedConfigDirectory, ConfigFileMap[jsonFile]);
            var fileString = JSON.stringify(jsonData, null, 2);

            this.logger.debug('Writing to ' + fullFilePath);
            return this.fs.writeFileAsync(fullFilePath, fileString, 'utf8');
        }
    }, {
        key: 'directoryReady',
        value: function directoryReady() {
            var _this4 = this;

            return this._checkConfigDirExists().catch(function () {
                if (_this4.canCreateDir) {
                    _this4.logger.debug('Creating ' + _this4.resolvedConfigDirectory + '.');
                    return _this4.fs.mkdirAsync(_this4.resolvedConfigDirectory);
                } else {
                    throw new Error(_this4.resolvedConfigDirectory + ' is not a directory that exists.\nIf this is your first time running wafflebot, please create it and ensure it is readable/writable.');
                }
            });
        }
    }, {
        key: 'filesReady',
        value: function filesReady() {
            var _this5 = this;

            var exampleConfigPath = this.path.join(__dirname, '../config.example.json');

            return this.fs.readFileAsync(exampleConfigPath).then(function (exampleConfig) {
                return _bluebird2.default.join(_this5._ensureFileExists(ConfigFileMap[JSONFiles.ROOMS], '[]'), _this5._ensureFileExists(ConfigFileMap[JSONFiles.WATCH_USERS], '{}'), _this5._ensureFileExists(ConfigFileMap[JSONFiles.CONFIG], exampleConfig));
            });
        }
    }, {
        key: 'checkConfigFileSanity',
        value: function checkConfigFileSanity() {
            var _this6 = this;

            this.logger.debug('Checking the config files');

            return this.getFileJson(JSONFiles.CONFIG).then(function (configJson) {

                if (!configJson || !configJson.irc || configJson.irc.server == 'irc.example.com') {
                    _this6.logger.debug('Config file has not been configured');

                    var errorMessage = ['Hey there! It looks like this is the first time you\'re running Wafflebot.', 'That\'s great! Please configure ' + configFilePath + ' to set me up :)'].join('\n');

                    throw new Error(errorMessage);
                }

                if (!configJson.mail_transport_string) {
                    throw new Error('mail_transport_string required for email');
                }

                return configJson;
            });
        }
    }]);

    return ConfigFilesLoader;
}(_lentildi.LentilBase);

exports.default = ConfigFilesLoader;