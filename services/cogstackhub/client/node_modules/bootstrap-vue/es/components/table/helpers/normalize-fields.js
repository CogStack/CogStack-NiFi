"use strict";

exports.__esModule = true;
exports.default = void 0;

var _startcase = _interopRequireDefault(require("../../../utils/startcase"));

var _inspect = require("../../../utils/inspect");

var _object = require("../../../utils/object");

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Private function to massage field entry into common object format
var processField = function processField(key, value) {
  var field = null;

  if ((0, _inspect.isString)(value)) {
    // Label shortcut
    field = {
      key: key,
      label: value
    };
  } else if ((0, _inspect.isFunction)(value)) {
    // Formatter shortcut
    field = {
      key: key,
      formatter: value
    };
  } else if ((0, _inspect.isObject)(value)) {
    field = _objectSpread({}, value);
    field.key = field.key || key;
  } else if (value !== false) {
    // Fallback to just key

    /* istanbul ignore next */
    field = {
      key: key
    };
  }

  return field;
}; // We normalize fields into an array of objects
// [ { key:..., label:..., ...}, {...}, ..., {..}]


var normalizeFields = function normalizeFields(origFields, items) {
  var fields = [];

  if ((0, _inspect.isArray)(origFields)) {
    // Normalize array Form
    origFields.filter(function (f) {
      return f;
    }).forEach(function (f) {
      if ((0, _inspect.isString)(f)) {
        fields.push({
          key: f,
          label: (0, _startcase.default)(f)
        });
      } else if ((0, _inspect.isObject)(f) && f.key && (0, _inspect.isString)(f.key)) {
        // Full object definition. We use assign so that we don't mutate the original
        fields.push(_objectSpread({}, f));
      } else if ((0, _inspect.isObject)(f) && (0, _object.keys)(f).length === 1) {
        // Shortcut object (i.e. { 'foo_bar': 'This is Foo Bar' }
        var key = (0, _object.keys)(f)[0];
        var field = processField(key, f[key]);

        if (field) {
          fields.push(field);
        }
      }
    });
  } else if (origFields && (0, _inspect.isObject)(origFields) && (0, _object.keys)(origFields).length > 0) {
    // Normalize object Form (deprecated)
    (0, _object.keys)(origFields).forEach(function (key) {
      var field = processField(key, origFields[key]);

      if (field) {
        fields.push(field);
      }
    });
  } // If no field provided, take a sample from first record (if exits)


  if (fields.length === 0 && (0, _inspect.isArray)(items) && items.length > 0) {
    var sample = items[0];
    (0, _object.keys)(sample).forEach(function (k) {
      if (!_constants.IGNORED_FIELD_KEYS[k]) {
        fields.push({
          key: k,
          label: (0, _startcase.default)(k)
        });
      }
    });
  } // Ensure we have a unique array of fields and that they have String labels


  var memo = {};
  return fields.filter(function (f) {
    if (!memo[f.key]) {
      memo[f.key] = true;
      f.label = (0, _inspect.isString)(f.label) ? f.label : (0, _startcase.default)(f.key);
      return true;
    }

    return false;
  });
};

var _default = normalizeFields;
exports.default = _default;