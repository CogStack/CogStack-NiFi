"use strict";

exports.__esModule = true;
exports.default = void 0;

var _upperFirst = _interopRequireDefault(require("./upper-first"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Suffix can be a falsey value so nothing is appended to string.
 * (helps when looping over props & some shouldn't change)
 * Use data last parameters to allow for currying.
 * @param {string} suffix
 * @param {string} str
 */
var suffixPropName = function suffixPropName(suffix, str) {
  return str + (suffix ? (0, _upperFirst.default)(suffix) : '');
};

var _default = suffixPropName;
exports.default = _default;