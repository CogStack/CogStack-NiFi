"use strict";

exports.__esModule = true;
exports.default = void 0;

var componentPlugins = _interopRequireWildcard(require("./components"));

var directivePlugins = _interopRequireWildcard(require("./directives"));

var _plugins = require("./utils/plugins");

var _config = require("./utils/config");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var install = function install(Vue) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (install.installed) {
    /* istanbul ignore next */
    return;
  }

  install.installed = true; // Configure BootstrapVue

  (0, _config.setConfig)(config); // Register component plugins

  (0, _plugins.registerPlugins)(Vue, componentPlugins); // Register directive plugins

  (0, _plugins.registerPlugins)(Vue, directivePlugins);
};

install.installed = false;
var BootstrapVue = {
  install: install,
  setConfig: _config.setConfig // Auto installation only occurs if window.Vue exists

};
(0, _plugins.vueUse)(BootstrapVue);
var _default = BootstrapVue;
exports.default = _default;