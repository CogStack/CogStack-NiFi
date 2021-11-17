"use strict";

exports.__esModule = true;
exports.default = void 0;

var _object = require("./object");

var memoize = function memoize(fn) {
  var cache = (0, _object.create)(null);
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var argsKey = JSON.stringify(args);
    return cache[argsKey] = cache[argsKey] || fn.apply(null, args);
  };
};

var _default = memoize;
exports.default = _default;