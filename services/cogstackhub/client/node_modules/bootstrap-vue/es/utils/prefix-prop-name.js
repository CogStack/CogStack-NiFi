"use strict";

exports.__esModule = true;
exports.default = void 0;

var _upperFirst = _interopRequireDefault(require("./upper-first"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param {string} prefix
 * @param {string} value
 */
var prefixPropName = function prefixPropName(prefix, value) {
  return prefix + (0, _upperFirst.default)(value);
};

var _default = prefixPropName;
exports.default = _default;