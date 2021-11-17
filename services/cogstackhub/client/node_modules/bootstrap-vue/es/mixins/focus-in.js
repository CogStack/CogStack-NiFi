"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = require("../utils/dom");

// @vue/component
var _default = {
  data: function data() {
    return {
      listenForFocusIn: false
    };
  },
  watch: {
    listenForFocusIn: function listenForFocusIn(newValue, oldValue) {
      if (newValue !== oldValue) {
        (0, _dom.eventOff)(this.focusInElement, 'focusin', this._focusInHandler, false);

        if (newValue) {
          (0, _dom.eventOn)(this.focusInElement, 'focusin', this._focusInHandler, false);
        }
      }
    }
  },
  beforeCreate: function beforeCreate() {
    // Declare non-reactive properties
    this.focusInElement = null;
  },
  mounted: function mounted() {
    if (!this.focusInElement) {
      this.focusInElement = document;
    }

    if (this.listenForFocusIn) {
      (0, _dom.eventOn)(this.focusInElement, 'focusin', this._focusInHandler, false);
    }
  },
  beforeDestroy: function beforeDestroy()
  /* istanbul ignore next */
  {
    (0, _dom.eventOff)(this.focusInElement, 'focusin', this._focusInHandler, false);
  },
  methods: {
    _focusInHandler: function _focusInHandler(evt) {
      if (this.focusInHandler) {
        this.focusInHandler(evt);
      }
    }
  }
};
exports.default = _default;