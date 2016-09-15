'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fs2 = require('fs');

var _fs3 = _interopRequireDefault(_fs2);

var _path2 = require('path');

var _path3 = _interopRequireDefault(_path2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_bluebird2.default.promisifyAll(_fs3.default);

var FileActions = function FileActions(_ref) {
    var logger = _ref.logger;
    var fs = _ref._fs;
    var path = _ref._path;

    _classCallCheck(this, FileActions);

    this.logger = logger;
    this.fs = _fs;
    this.path = _path;
};

exports.default = FileActions;
;