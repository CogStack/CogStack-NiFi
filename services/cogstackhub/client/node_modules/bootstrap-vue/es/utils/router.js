"use strict";

exports.__esModule = true;
exports.computeHref = exports.computeRel = exports.computeTag = exports.isRouterLink = exports.parseQuery = exports.stringifyQueryObj = void 0;

var _toString = _interopRequireDefault(require("./to-string"));

var _inspect = require("./inspect");

var _object = require("./object");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ANCHOR_TAG = 'a'; // Precompile RegExp

var commaRE = /%2C/g;
var encodeReserveRE = /[!'()*]/g; // Method to replace reserved chars

var encodeReserveReplacer = function encodeReserveReplacer(c) {
  return '%' + c.charCodeAt(0).toString(16);
}; // Fixed encodeURIComponent which is more conformant to RFC3986:
// - escapes [!'()*]
// - preserve commas


var encode = function encode(str) {
  return encodeURIComponent((0, _toString.default)(str)).replace(encodeReserveRE, encodeReserveReplacer).replace(commaRE, ',');
};

var decode = decodeURIComponent; // Stringifies an object of query parameters
// See: https://github.com/vuejs/vue-router/blob/dev/src/util/query.js

var stringifyQueryObj = function stringifyQueryObj(obj) {
  if (!(0, _inspect.isPlainObject)(obj)) {
    return '';
  }

  var query = (0, _object.keys)(obj).map(function (key) {
    var val = obj[key];

    if ((0, _inspect.isUndefined)(val)) {
      return '';
    } else if ((0, _inspect.isNull)(val)) {
      return encode(key);
    } else if ((0, _inspect.isArray)(val)) {
      return val.reduce(function (results, val2) {
        if ((0, _inspect.isNull)(val2)) {
          results.push(encode(key));
        } else if (!(0, _inspect.isUndefined)(val2)) {
          // Faster than string interpolation
          results.push(encode(key) + '=' + encode(val2));
        }

        return results;
      }, []).join('&');
    } // Faster than string interpolation


    return encode(key) + '=' + encode(val);
  })
  /* must check for length, as we only want to filter empty strings, not things that look falsey! */
  .filter(function (x) {
    return x.length > 0;
  }).join('&');
  return query ? "?".concat(query) : '';
};

exports.stringifyQueryObj = stringifyQueryObj;

var parseQuery = function parseQuery(query) {
  var parsed = {};
  query = (0, _toString.default)(query).trim().replace(/^(\?|#|&)/, '');

  if (!query) {
    return parsed;
  }

  query.split('&').forEach(function (param) {
    var parts = param.replace(/\+/g, ' ').split('=');
    var key = decode(parts.shift());
    var val = parts.length > 0 ? decode(parts.join('=')) : null;

    if ((0, _inspect.isUndefined)(parsed[key])) {
      parsed[key] = val;
    } else if ((0, _inspect.isArray)(parsed[key])) {
      parsed[key].push(val);
    } else {
      parsed[key] = [parsed[key], val];
    }
  });
  return parsed;
};

exports.parseQuery = parseQuery;

var isRouterLink = function isRouterLink(tag) {
  return tag !== ANCHOR_TAG;
};

exports.isRouterLink = isRouterLink;

var computeTag = function computeTag() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      to = _ref.to,
      disabled = _ref.disabled;

  var thisOrParent = arguments.length > 1 ? arguments[1] : undefined;
  return thisOrParent.$router && to && !disabled ? thisOrParent.$nuxt ? 'nuxt-link' : 'router-link' : ANCHOR_TAG;
};

exports.computeTag = computeTag;

var computeRel = function computeRel() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      target = _ref2.target,
      rel = _ref2.rel;

  if (target === '_blank' && (0, _inspect.isNull)(rel)) {
    return 'noopener';
  }

  return rel || null;
};

exports.computeRel = computeRel;

var computeHref = function computeHref() {
  var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      href = _ref3.href,
      to = _ref3.to;

  var tag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ANCHOR_TAG;
  var fallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '#';
  var toFallback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '/';

  // We've already checked the $router in computeTag(), so isRouterLink() indicates a live router.
  // When deferring to Vue Router's router-link, don't use the href attribute at all.
  // We return null, and then remove href from the attributes passed to router-link
  if (isRouterLink(tag)) {
    return null;
  } // Return `href` when explicitly provided


  if (href) {
    return href;
  } // Reconstruct `href` when `to` used, but no router


  if (to) {
    // Fallback to `to` prop (if `to` is a string)
    if ((0, _inspect.isString)(to)) {
      return to || toFallback;
    } // Fallback to `to.path + to.query + to.hash` prop (if `to` is an object)


    if ((0, _inspect.isPlainObject)(to) && (to.path || to.query || to.hash)) {
      var path = (0, _toString.default)(to.path);
      var query = stringifyQueryObj(to.query);
      var hash = (0, _toString.default)(to.hash);
      hash = !hash || hash.charAt(0) === '#' ? hash : "#".concat(hash);
      return "".concat(path).concat(query).concat(hash) || toFallback;
    }
  } // If nothing is provided return the fallback


  return fallback;
};

exports.computeHref = computeHref;