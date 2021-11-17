"use strict";

exports.__esModule = true;
exports.HTMLElement = void 0;

var _env = require("./env");

/**
 * SSR safe types
 */
var w = _env.hasWindowSupport ? window : {};
var HTMLElement = w.HTMLElement || Object;
exports.HTMLElement = HTMLElement;