"use strict";

exports.__esModule = true;
exports.default = void 0;

var _html = require("../../../utils/html");

var _inspect = require("../../../utils/inspect");

var _default = {
  props: {
    showEmpty: {
      type: Boolean,
      default: false
    },
    emptyText: {
      type: String,
      default: 'There are no records to show'
    },
    emptyHtml: {
      type: String
    },
    emptyFilteredText: {
      type: String,
      default: 'There are no records matching your request'
    },
    emptyFilteredHtml: {
      type: String
    }
  },
  methods: {
    renderEmpty: function renderEmpty() {
      var h = this.$createElement;
      var items = this.computedItems;
      var $empty;

      if (this.showEmpty && (!items || items.length === 0) && !(this.computedBusy && this.hasNormalizedSlot('table-busy'))) {
        $empty = this.normalizeSlot(this.isFiltered ? 'emptyfiltered' : 'empty', {
          emptyFilteredHtml: this.emptyFilteredHtml,
          emptyFilteredText: this.emptyFilteredText,
          emptyHtml: this.emptyHtml,
          emptyText: this.emptyText,
          fields: this.computedFields,
          // Not sure why this is included, as it will always be an empty array
          items: this.computedItems
        });

        if (!$empty) {
          $empty = h('div', {
            class: ['text-center', 'my-2'],
            domProps: this.isFiltered ? (0, _html.htmlOrText)(this.emptyFilteredHtml, this.emptyFilteredText) : (0, _html.htmlOrText)(this.emptyHtml, this.emptyText)
          });
        }

        $empty = h('td', {
          attrs: {
            colspan: String(this.computedFields.length),
            role: 'cell'
          }
        }, [h('div', {
          attrs: {
            role: 'alert',
            'aria-live': 'polite'
          }
        }, [$empty])]);
        $empty = h('tr', {
          key: this.isFiltered ? '_b-table-empty-filtered-row_' : '_b-table-empty-row_',
          staticClass: 'b-table-empty-row',
          class: [(0, _inspect.isFunction)(this.tbodyTrClass) ? this.tbodyTrClass(null, 'row-empty') : this.tbodyTrClass],
          attrs: {
            role: 'row'
          }
        }, [$empty]);
      }

      return $empty || h(false);
    }
  }
};
exports.default = _default;