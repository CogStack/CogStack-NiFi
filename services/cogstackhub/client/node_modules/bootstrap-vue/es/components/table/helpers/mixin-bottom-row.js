"use strict";

exports.__esModule = true;
exports.default = void 0;

var _inspect = require("../../../utils/inspect");

var _default = {
  methods: {
    renderBottomRow: function renderBottomRow() {
      var h = this.$createElement; // Static bottom row slot (hidden in visibly stacked mode as we can't control the data-label)
      // If in always stacked mode, we don't bother rendering the row

      if (!this.hasNormalizedSlot('bottom-row') || this.isStacked === true) {
        return h(false);
      }

      var fields = this.computedFields;
      return h('tr', {
        key: '__b-table-bottom-row__',
        staticClass: 'b-table-bottom-row',
        class: [(0, _inspect.isFunction)(this.tbodyTrClass) ? this.tbodyTrClass(null, 'row-bottom') : this.tbodyTrClass],
        attrs: {
          role: 'row'
        }
      }, this.normalizeSlot('bottom-row', {
        columns: fields.length,
        fields: fields
      }));
    }
  }
};
exports.default = _default;