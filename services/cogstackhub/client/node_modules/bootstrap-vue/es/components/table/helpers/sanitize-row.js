"use strict";

exports.__esModule = true;
exports.default = sanitizeRow;

var _object = require("../../../utils/object");

var _constants = require("./constants");

// Return a copy of a row after all reserved fields have been filtered out
// TODO: add option to specify which fields to include
function sanitizeRow(row) {
  return (0, _object.keys)(row).reduce(function (obj, key) {
    // Ignore special fields that start with _
    if (!_constants.IGNORED_FIELD_KEYS[key]) {
      obj[key] = row[key];
    }

    return obj;
  }, {});
}