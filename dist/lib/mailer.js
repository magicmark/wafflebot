'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lentildi = require('lentildi');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Mailer = function (_LentilBase) {
    _inherits(Mailer, _LentilBase);

    _createClass(Mailer, null, [{
        key: 'lentilDeps',
        value: function lentilDeps() {
            return {
                logger: _lentildi.LentilDep.Provided('logger'),
                nodemailer: _nodemailer2.default,
                moment: _moment2.default
            };
        }
    }]);

    function Mailer(mail_transport_string) {
        var _Object$getPrototypeO;

        _classCallCheck(this, Mailer);

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Mailer)).call.apply(_Object$getPrototypeO, [this].concat(args)));

        _this.transporter = _this.nodemailer.createTransport(mail_transport_string);
        return _this;
    }

    _createClass(Mailer, [{
        key: 'send',
        value: function send(to, message) {
            var _this2 = this;

            var timeNow = this.moment().format('dddd MMMM Do, [a]t h:mma');
            var messageString = 'You were mentioned in ' + message.channel + ' on ' + timeNow + '\n\n' + message.author + ' said:\n\n' + message.body + '\n\n--\nSent to you by Wafflebot. Here is a horse 🐴';

            var mailOptions = {
                from: 'Wafflebot <markl+wafflebot@yelp.com>',
                to: to,
                subject: '💬 IRC Notification | ' + message.channel + ' 💬',
                text: messageString,
                replyTo: message.author + '@yelp.com',
                priority: 'high'
            };

            this.transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    _this2.logger.error(error);
                    return;
                }
                _this2.logger.info('Message sent: ', info.response);
            });
        }
    }]);

    return Mailer;
}(_lentildi.LentilBase);

exports.default = Mailer;