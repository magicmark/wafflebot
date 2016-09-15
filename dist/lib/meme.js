'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _lentildi = require('lentildi');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Meme = function (_LentilBase) {
    _inherits(Meme, _LentilBase);

    _createClass(Meme, null, [{
        key: 'lentilDeps',
        value: function lentilDeps() {
            return {
                logger: _lentildi.LentilDep.Provided('logger'),
                request: _requestPromise2.default
            };
        }
    }]);

    function Meme(auth) {
        var _Object$getPrototypeO;

        _classCallCheck(this, Meme);

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Meme)).call.apply(_Object$getPrototypeO, [this].concat(args)));

        _this.auth = auth;
        return _this;
    }

    _createClass(Meme, [{
        key: '_parseLines',
        value: function _parseLines(text) {
            var regexMatch = text.match(/"(.*?)"/g);

            if (regexMatch) {
                return regexMatch.map(function (lineMatch) {
                    return lineMatch.substr(1, lineMatch.length - 2);
                }).filter(function (lineMatch) {
                    return !!lineMatch;
                });
            }

            return [];
        }
    }, {
        key: 'create',
        value: function create(text) {
            var _this2 = this;

            var memeLines = this._parseLines(text);

            if (memeLines.length !== 1 && memeLines.length !== 2) {
                return _bluebird2.default.reject('Invalid number of meme lines in "' + text + '"');
            }

            var params = {
                template_id: '63278523',
                username: this.auth.username,
                password: this.auth.password,
                text0: memeLines[0]
            };

            if (memeLines[1]) {
                params.text1 = memeLines[1];
            }

            var paramsWithoutPassword = Object.assign({}, params, {
                password: "******"
            });
            this.logger.info('Creating meme', text, paramsWithoutPassword);

            return this.request.post('https://api.imgflip.com/caption_image', {
                form: params
            }).then(function (body) {
                var jsonBody = JSON.parse(body);

                if (jsonBody.success && jsonBody.data && jsonBody.data.url) {
                    return jsonBody.data.url;
                }

                _this2.logger.error('Meme API error', jsonBody);
                throw new Error('Meme API Error');
            });
        }
    }]);

    return Meme;
}(_lentildi.LentilBase);

exports.default = Meme;