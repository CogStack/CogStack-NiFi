"use strict";

exports.__esModule = true;
exports.default = filterEvent;

var _dom = require("../../../utils/dom");

var _constants = require("./constants");

// Returns true of we should ignore the click/dbclick/keypress event
// Avoids having the user need to use @click.stop on the form control
function filterEvent(evt) {
  if (!evt || !evt.target) {
    /* istanbul ignore next */
    return;
  }

  var el = evt.target;

  if (el.tagName === 'TD' || el.tagName === 'TH' || el.tagName === 'TR' || el.disabled) {
    // Shortut all the following tests for efficiency
    return false;
  }

  if ((0, _dom.closest)('.dropdown-menu', el)) {
    // Click was in a dropdown menu, so ignore
    return true;
  }

  var label = el.tagName === 'LABEL' ? el : (0, _dom.closest)('label', el);

  if (label && label.control && !label.control.disabled) {
    // If the label's form control is not disabled then we don't propagate evt
    return true;
  } // Else check to see if the event target matches one of the selectors in the event filter
  // i.e. anchors, non disabled inputs, etc. Return true if we should ignore the event.


  return (0, _dom.matches)(el, _constants.EVENT_FILTER);
}