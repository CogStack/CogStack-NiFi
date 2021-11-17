"use strict";

exports.__esModule = true;
exports.default = void 0;

var _config = require("./utils/config");

//
// Utility Plugin for setting the configuration
//
var BVConfigPlugin = {
  install: function install(Vue) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _config.setConfig)(config);
  }
};
var _default = BVConfigPlugin;
exports.default = _default;