"use strict";

exports.__esModule = true;
exports.default = void 0;

var _identity = _interopRequireDefault(require("./identity"));

var _inspect = require("./inspect");

var _object = require("./object");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Given an array of properties or an object of property keys,
 * plucks all the values off the target object, returning a new object
 * that has props that reference the original prop values
 *
 * @param {{}|string[]} keysToPluck
 * @param {{}} objToPluck
 * @param {Function} transformFn
 * @return {{}}
 */
var pluckProps = function pluckProps(keysToPluck, objToPluck) {
  var transformFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _identity.default;
  return ((0, _inspect.isArray)(keysToPluck) ? keysToPluck.slice() : (0, _object.keys)(keysToPluck)).reduce(function (memo, prop) {
    memo[transformFn(prop)] = objToPluck[prop];
    return memo;
  }, {});
};

var _default = pluckProps;
exports.default = _default;