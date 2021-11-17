"use strict";

exports.__esModule = true;
exports.default = void 0;

var _lowerFirst = _interopRequireDefault(require("./lower-first"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param {string} prefix
 * @param {string} value
 */
var unprefixPropName = function unprefixPropName(prefix, value) {
  return (0, _lowerFirst.default)(value.replace(prefix, ''));
};

var _default = unprefixPropName;
exports.default = _default;