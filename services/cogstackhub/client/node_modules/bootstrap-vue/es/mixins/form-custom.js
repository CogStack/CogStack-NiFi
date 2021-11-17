"use strict";

exports.__esModule = true;
exports.default = void 0;
// @vue/component
var _default = {
  props: {
    plain: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    custom: function custom() {
      return !this.plain;
    }
  }
};
exports.default = _default;