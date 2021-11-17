"use strict";

exports.__esModule = true;
exports.isPromise = exports.isRegExp = exports.isDate = exports.isPrimitive = exports.isNumber = exports.isString = exports.isBoolean = exports.isFunction = exports.isNull = exports.isUndefined = exports.toRawTypeLC = exports.toRawType = exports.toType = void 0;

var _array = require("./array");

exports.isArray = _array.isArray;

var _object = require("./object");

exports.isObject = _object.isObject;
exports.isPlainObject = _object.isPlainObject;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var toType = function toType(val) {
  return _typeof(val);
};

exports.toType = toType;

var toRawType = function toRawType(val) {
  return Object.prototype.toString.call(val).slice(8, -1);
};

exports.toRawType = toRawType;

var toRawTypeLC = function toRawTypeLC(val) {
  return toRawType(val).toLowerCase();
};

exports.toRawTypeLC = toRawTypeLC;

var isUndefined = function isUndefined(val) {
  return val === undefined;
};

exports.isUndefined = isUndefined;

var isNull = function isNull(val) {
  return val === null;
};

exports.isNull = isNull;

var isFunction = function isFunction(val) {
  return toType(val) === 'function';
};

exports.isFunction = isFunction;

var isBoolean = function isBoolean(val) {
  return toType(val) === 'boolean';
};

exports.isBoolean = isBoolean;

var isString = function isString(val) {
  return toType(val) === 'string';
};

exports.isString = isString;

var isNumber = function isNumber(val) {
  return toType(val) === 'number';
};

exports.isNumber = isNumber;

var isPrimitive = function isPrimitive(val) {
  return isBoolean(val) || isString(val) || isNumber(val);
};

exports.isPrimitive = isPrimitive;

var isDate = function isDate(val) {
  return val instanceof Date;
};

exports.isDate = isDate;

var isRegExp = function isRegExp(val) {
  return toRawType(val) === 'RegExp';
};

exports.isRegExp = isRegExp;

var isPromise = function isPromise(val) {
  return !isUndefined(val) && !isNull(val) && isFunction(val.then) && isFunction(val.catch);
}; // Extra convenience named re-exports


exports.isPromise = isPromise;