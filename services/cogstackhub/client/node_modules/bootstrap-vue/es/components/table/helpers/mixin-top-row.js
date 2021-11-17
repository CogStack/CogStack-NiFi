"use strict";

exports.__esModule = true;
exports.default = void 0;

var _inspect = require("../../../utils/inspect");

var _default = {
  methods: {
    renderTopRow: function renderTopRow() {
      var h = this.$createElement; // Add static Top Row slot (hidden in visibly stacked mode as we can't control the data-label)
      // If in always stacked mode, we don't bother rendering the row

      if (!this.hasNormalizedSlot('top-row') || this.isStacked === true) {
        return h(false);
      }

      var fields = this.computedFields;
      return h('tr', {
        key: 'top-row',
        staticClass: 'b-table-top-row',
        class: [(0, _inspect.isFunction)(this.tbodyTrClass) ? this.tbodyTrClass(null, 'row-top') : this.tbodyTrClass],
        attrs: {
          role: 'row'
        }
      }, [this.normalizeSlot('top-row', {
        columns: fields.length,
        fields: fields
      })]);
    }
  }
};
exports.default = _default;