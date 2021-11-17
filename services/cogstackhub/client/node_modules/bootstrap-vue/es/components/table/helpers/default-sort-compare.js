"use strict";

exports.__esModule = true;
exports.default = defaultSortCompare;

var _get = _interopRequireDefault(require("../../../utils/get"));

var _inspect = require("../../../utils/inspect");

var _stringifyObjectValues = _interopRequireDefault(require("./stringify-object-values"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Default sort compare routine
//
// TODO: add option to sort by multiple columns (tri-state per column, plus order of columns in sort)
//  where sortBy could be an array of objects [ {key: 'foo', sortDir: 'asc'}, {key:'bar', sortDir: 'desc'} ...]
//  or an array of arrays [ ['foo','asc'], ['bar','desc'] ]
function defaultSortCompare(a, b, sortBy) {
  a = (0, _get.default)(a, sortBy, '');
  b = (0, _get.default)(b, sortBy, '');

  if ((0, _inspect.isDate)(a) && (0, _inspect.isDate)(b) || (0, _inspect.isNumber)(a) && (0, _inspect.isNumber)(b)) {
    // Special case for comparing Dates and Numbers
    // Internally dates are compared via their epoch number values
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  } else {
    // Do localized string comparison
    return (0, _stringifyObjectValues.default)(a).localeCompare((0, _stringifyObjectValues.default)(b), undefined, {
      numeric: true
    });
  }
}