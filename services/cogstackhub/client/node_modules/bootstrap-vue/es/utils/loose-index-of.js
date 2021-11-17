"use strict";

exports.__esModule = true;
exports.default = void 0;

var _looseEqual = _interopRequireDefault(require("./loose-equal"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var looseIndexOf = function looseIndexOf(arr, val) {
  // Assumes that the first argument is an array
  for (var i = 0; i < arr.length; i++) {
    if ((0, _looseEqual.default)(arr[i], val)) {
      return i;
    }
  }

  return -1;
};

var _default = looseIndexOf;
exports.default = _default;