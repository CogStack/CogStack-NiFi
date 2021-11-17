"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = require("../utils/dom");

// @vue/component
var _default = {
  data: function data() {
    return {
      listenForClickOut: false
    };
  },
  watch: {
    listenForClickOut: function listenForClickOut(newValue, oldValue) {
      if (newValue !== oldValue) {
        (0, _dom.eventOff)(this.clickOutElement, this.clickOutEventName, this._clickOutHandler, false);

        if (newValue) {
          (0, _dom.eventOn)(this.clickOutElement, this.clickOutEventName, this._clickOutHandler, false);
        }
      }
    }
  },
  beforeCreate: function beforeCreate() {
    // Declare non-reactive properties
    this.clickOutElement = null;
    this.clickOutEventName = null;
  },
  mounted: function mounted() {
    if (!this.clickOutElement) {
      this.clickOutElement = document;
    }

    if (!this.clickOutEventName) {
      this.clickOutEventName = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click';
    }

    if (this.listenForClickOut) {
      (0, _dom.eventOn)(this.clickOutElement, this.clickOutEventName, this._clickOutHandler, false);
    }
  },
  beforeDestroy: function beforeDestroy()
  /* istanbul ignore next */
  {
    (0, _dom.eventOff)(this.clickOutElement, this.clickOutEventName, this._clickOutHandler, false);
  },
  methods: {
    isClickOut: function isClickOut(evt) {
      return !(0, _dom.contains)(this.$el, evt.target);
    },
    _clickOutHandler: function _clickOutHandler(evt) {
      if (this.clickOutHandler && this.isClickOut(evt)) {
        this.clickOutHandler(evt);
      }
    }
  }
};
exports.default = _default;