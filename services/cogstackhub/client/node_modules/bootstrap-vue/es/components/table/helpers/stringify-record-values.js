"use strict";

exports.__esModule = true;
exports.default = stringifyRecordValues;

var _sanitizeRow = _interopRequireDefault(require("./sanitize-row"));

var _stringifyObjectValues = _interopRequireDefault(require("./stringify-object-values"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Stringifies the values of a record, ignoring any special top level field keys
// TODO: add option to strigify formatted/scopedSlot items, and only specific fields
function stringifyRecordValues(row) {
  /* istanbul ignore else */
  if (row instanceof Object) {
    return (0, _stringifyObjectValues.default)((0, _sanitizeRow.default)(row));
  } else {
    /* istanbul ignore next */
    return '';
  }
}