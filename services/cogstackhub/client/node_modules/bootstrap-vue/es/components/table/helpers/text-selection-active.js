"use strict";

exports.__esModule = true;
exports.default = textSelectionActive;

var _dom = require("../../../utils/dom");

// Helper to determine if a there is an active text selection on the document page.
// Used to filter out click events caused by the mouse up at end of selection
//
// Accepts an element as only argument to test to see if selection overlaps or is
// contained within the element
function textSelectionActive() {
  var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
  var win = window;
  /* istanbul ignore if: JSDOM doesn't support getSelection */

  if (win && win.getSelection && win.getSelection().toString() !== '' && (0, _dom.isElement)(el)) {
    /* istanbul ignore next: JSDOM doesn't support getSelection */
    var sel = win.getSelection();
    /* istanbul ignore next: JSDOM doesn't support getSelection */

    return sel.containsNode ? sel.containsNode(el, true) : false;
  } else {
    return false;
  }
}