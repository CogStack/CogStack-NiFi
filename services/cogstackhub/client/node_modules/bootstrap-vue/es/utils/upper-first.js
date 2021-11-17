"use strict";

exports.__esModule = true;
exports.default = void 0;

var _inspect = require("./inspect");

/**
 * Transform the first character to uppercase
 * @param {string} str
 */
var upperFirst = function upperFirst(str) {
  if (!(0, _inspect.isString)(str)) {
    str = String(str);
  }

  str = str.trim();
  return str.charAt(0).toUpperCase() + str.slice(1);
};

var _default = upperFirst;
exports.default = _default;