"use strict";

exports.__esModule = true;
exports.default = void 0;

var _inspect = require("./inspect");

/**
 * Convert a value to a string that can be rendered.
 */
var toString = function toString(val) {
  var spaces = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
  return (0, _inspect.isUndefined)(val) || (0, _inspect.isNull)(val) ? '' : (0, _inspect.isArray)(val) || (0, _inspect.isPlainObject)(val) && val.toString === Object.prototype.toString ? JSON.stringify(val, null, spaces) : String(val);
};

var _default = toString;
exports.default = _default;