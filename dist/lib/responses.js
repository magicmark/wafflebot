'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _waffle = require('./../static/waffle.js');

var _waffle2 = _interopRequireDefault(_waffle);

var _waffle_history = require('./../static/waffle_history.js');

var _waffle_history2 = _interopRequireDefault(_waffle_history);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lentildi = require('lentildi');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

_bluebird2.default.promisifyAll(_fs2.default);

var Responses = function (_LentilBase) {
    _inherits(Responses, _LentilBase);

    _createClass(Responses, null, [{
        key: 'lentilDeps',
        value: function lentilDeps() {
            return {
                logger: _lentildi.LentilDep.Provided('logger'),
                BigWaffle: _waffle2.default,
                WaffleHistory: _waffle_history2.default,
                path: _path2.default,
                fs: _fs2.default
            };
        }
    }]);

    function Responses() {
        var _Object$getPrototypeO;

        _classCallCheck(this, Responses);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Responses)).call.apply(_Object$getPrototypeO, [this].concat(args)));

        _this._responses = new Map();
        _this._loadResponses();
        return _this;
    }

    _createClass(Responses, [{
        key: '_loadResponses',
        value: function _loadResponses() {
            var _this2 = this;

            var responsesPath = this.path.join(__dirname, '../responses.json');

            return this.fs.readFileAsync(responsesPath, 'utf8').then(function (data) {
                var responsesJson = JSON.parse(data);
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = responsesJson[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var response = _step.value;

                        _this2.add(response);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            });
        }
    }, {
        key: '_compileResponseBody',
        value: function _compileResponseBody(responseBody, message, regexMatches, depth) {
            depth = depth || 1;

            if (depth > 2) {
                return responseBody;
            }

            var wafffleHistory = this._compileResponseBody(this.WaffleHistory, message, regexMatches, ++depth);

            return responseBody.replace(/{waffle}/gi, this.BigWaffle).replace(/{author}/gi, message.author).replace(/{waffleHistory}/i, wafffleHistory).replace(/{\$[0-9]+}/gi, function (match) {
                return regexMatches.shift();
            });
        }
    }, {
        key: '_getCompiledResponse',
        value: function _getCompiledResponse(response, message, regexMatches) {
            return this._compileResponseBody(response.body, message, regexMatches);
        }
    }, {
        key: '_getCompiledRegexString',
        value: function _getCompiledRegexString(response) {
            var compiledRegexString = response.regex.replace(/{\$[0-9]+}/gi, '(\\w+)');
            return new RegExp(compiledRegexString, 'i');
        }
    }, {
        key: 'add',
        value: function add(_ref) {
            var match = _ref.match;
            var body = _ref.body;
            var _ref$roomGuard = _ref.roomGuard;
            var roomGuard = _ref$roomGuard === undefined ? false : _ref$roomGuard;
            var _ref$requiresPrefix = _ref.requiresPrefix;
            var requiresPrefix = _ref$requiresPrefix === undefined ? false : _ref$requiresPrefix;
            var _ref$delay = _ref.delay;
            var delay = _ref$delay === undefined ? 0 : _ref$delay;

            this._responses.set(match, {
                regex: match,
                body: body,
                roomGuard: roomGuard,
                requiresPrefix: requiresPrefix,
                delay: delay
            });
        }
    }, {
        key: 'maybeGetResponse',
        value: function maybeGetResponse(message) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._responses.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var response = _step2.value;

                    var regex = this._getCompiledRegexString(response);
                    var match = message.body.match(regex);

                    if (match) {
                        var compiledResponseBody = this._getCompiledResponse(response, message, match.slice(1));

                        return Object.assign({}, response, {
                            body: compiledResponseBody
                        });
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    }]);

    return Responses;
}(_lentildi.LentilBase);

exports.default = Responses;