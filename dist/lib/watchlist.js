'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lentildi = require('lentildi');

var _config_files = require('./config_files.js');

var _config_files2 = _interopRequireDefault(_config_files);

var _mailer = require('./mailer.js');

var _mailer2 = _interopRequireDefault(_mailer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WatchList = function (_LentilBase) {
    _inherits(WatchList, _LentilBase);

    function WatchList() {
        _classCallCheck(this, WatchList);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(WatchList).apply(this, arguments));
    }

    _createClass(WatchList, [{
        key: 'subscribe',
        value: function subscribe(user, email) {
            this.users[user] = {
                email: email
            };

            return file_actions.add_user_watch(user, email);
        }
    }, {
        key: 'checkMessage',
        value: function checkMessage(message) {
            var emailAddress = this.watchlist.check(message);
            if (emailAddress) {
                this.mailer.send(emailAddress, message);
            }
        }
    }, {
        key: '_check',
        value: function _check(message) {
            for (var user in this.users) {
                if (RegExp('(^| +)' + user, 'ig').test(message)) {
                    return this.users[user].email;
                }
            }
        }
    }], [{
        key: 'lentilDeps',
        value: function lentilDeps() {
            return {
                mailer: _mailer2.default,
                configFilesLoader: _config_files2.default,
                logger: _lentildi.LentilDep.Provided('logger')
            };
        }
    }]);

    return WatchList;
}(_lentildi.LentilBase);

exports.default = WatchList;