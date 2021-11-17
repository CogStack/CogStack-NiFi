"use strict";

exports.__esModule = true;
exports.EVENT_FILTER = exports.IGNORED_FIELD_KEYS = void 0;
// Constants used by table helpers
// Object of item keys that should be ignored for headers and stringification and filter events
var IGNORED_FIELD_KEYS = {
  _rowVariant: true,
  _cellVariants: true,
  _showDetails: true // Filter CSS Selector for click/dblclick/etc events
  // If any of these selectors match the clicked element, we ignore the event

};
exports.IGNORED_FIELD_KEYS = IGNORED_FIELD_KEYS;
var EVENT_FILTER = ['a', 'a *', // include content inside links
'button', 'button *', // include content inside buttons
'input:not(.disabled):not([disabled])', 'select:not(.disabled):not([disabled])', 'textarea:not(.disabled):not([disabled])', '[role="link"]', '[role="link"] *', '[role="button"]', '[role="button"] *', '[tabindex]:not(.disabled):not([disabled])'].join(',');
exports.EVENT_FILTER = EVENT_FILTER;