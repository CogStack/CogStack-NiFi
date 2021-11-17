"use strict";

exports.__esModule = true;
exports.default = void 0;
// @vue/component
var _default = {
  props: {
    name: {
      type: String // default: undefined

    },
    id: {
      type: String // default: undefined

    },
    disabled: {
      type: Boolean
    },
    required: {
      type: Boolean,
      default: false
    },
    form: {
      type: String,
      default: null
    }
  }
};
exports.default = _default;