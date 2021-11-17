"use strict";

exports.__esModule = true;
exports.concat = exports.arrayIncludes = exports.isArray = exports.from = void 0;

var _from = _interopRequireDefault(require("core-js/library/fn/array/from"));

var _isArray = _interopRequireDefault(require("core-js/library/fn/array/is-array"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// --- Static ---
var from = Array.from || _from.default;
exports.from = from;
var isArray = Array.isArray || _isArray.default; // --- Instance ---

exports.isArray = isArray;

var arrayIncludes = function arrayIncludes(array, value) {
  return array.indexOf(value) !== -1;
};

exports.arrayIncludes = arrayIncludes;

var concat = function concat() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return Array.prototype.concat.apply([], args);
};

exports.concat = concat;