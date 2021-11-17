(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vue')) :
  typeof define === 'function' && define.amd ? define(['vue'], factory) :
  (global = global || self, global.bootstrapVue = factory(global.Vue));
}(this, function (Vue) { 'use strict';

  Vue = Vue && Vue.hasOwnProperty('default') ? Vue['default'] : Vue;

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  //

  // 7.1.4 ToInteger
  var ceil = Math.ceil;
  var floor = Math.floor;
  var _toInteger = function (it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  };

  // 7.2.1 RequireObjectCoercible(argument)
  var _defined = function (it) {
    if (it == undefined) throw TypeError("Can't call method on  " + it);
    return it;
  };

  // true  -> String#at
  // false -> String#codePointAt
  var _stringAt = function (TO_STRING) {
    return function (that, pos) {
      var s = String(_defined(that));
      var i = _toInteger(pos);
      var l = s.length;
      var a, b;
      if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
      a = s.charCodeAt(i);
      return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
    };
  };

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var _global = createCommonjsModule(function (module) {
  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global = module.exports = typeof window != 'undefined' && window.Math == Math
    ? window : typeof self != 'undefined' && self.Math == Math ? self
    // eslint-disable-next-line no-new-func
    : Function('return this')();
  if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
  });

  var _core = createCommonjsModule(function (module) {
  var core = module.exports = { version: '2.6.5' };
  if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
  });
  var _core_1 = _core.version;

  var _aFunction = function (it) {
    if (typeof it != 'function') throw TypeError(it + ' is not a function!');
    return it;
  };

  // optional / simple context binding

  var _ctx = function (fn, that, length) {
    _aFunction(fn);
    if (that === undefined) return fn;
    switch (length) {
      case 1: return function (a) {
        return fn.call(that, a);
      };
      case 2: return function (a, b) {
        return fn.call(that, a, b);
      };
      case 3: return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
    }
    return function (/* ...args */) {
      return fn.apply(that, arguments);
    };
  };

  var _isObject = function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };

  var _anObject = function (it) {
    if (!_isObject(it)) throw TypeError(it + ' is not an object!');
    return it;
  };

  var _fails = function (exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  };

  // Thank's IE8 for his funny defineProperty
  var _descriptors = !_fails(function () {
    return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
  });

  var document$1 = _global.document;
  // typeof document.createElement is 'object' in old IE
  var is = _isObject(document$1) && _isObject(document$1.createElement);
  var _domCreate = function (it) {
    return is ? document$1.createElement(it) : {};
  };

  var _ie8DomDefine = !_descriptors && !_fails(function () {
    return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
  });

  // 7.1.1 ToPrimitive(input [, PreferredType])

  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string
  var _toPrimitive = function (it, S) {
    if (!_isObject(it)) return it;
    var fn, val;
    if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
    if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var dP = Object.defineProperty;

  var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
    _anObject(O);
    P = _toPrimitive(P, true);
    _anObject(Attributes);
    if (_ie8DomDefine) try {
      return dP(O, P, Attributes);
    } catch (e) { /* empty */ }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };

  var _objectDp = {
  	f: f
  };

  var _propertyDesc = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var _hide = _descriptors ? function (object, key, value) {
    return _objectDp.f(object, key, _propertyDesc(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var hasOwnProperty = {}.hasOwnProperty;
  var _has = function (it, key) {
    return hasOwnProperty.call(it, key);
  };

  var PROTOTYPE = 'prototype';

  var $export = function (type, name, source) {
    var IS_FORCED = type & $export.F;
    var IS_GLOBAL = type & $export.G;
    var IS_STATIC = type & $export.S;
    var IS_PROTO = type & $export.P;
    var IS_BIND = type & $export.B;
    var IS_WRAP = type & $export.W;
    var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
    var expProto = exports[PROTOTYPE];
    var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] : (_global[name] || {})[PROTOTYPE];
    var key, own, out;
    if (IS_GLOBAL) source = name;
    for (key in source) {
      // contains in native
      own = !IS_FORCED && target && target[key] !== undefined;
      if (own && _has(exports, key)) continue;
      // export native or passed
      out = own ? target[key] : source[key];
      // prevent global pollution for namespaces
      exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
      // bind timers to global for call from export context
      : IS_BIND && own ? _ctx(out, _global)
      // wrap global constructors for prevent change them in library
      : IS_WRAP && target[key] == out ? (function (C) {
        var F = function (a, b, c) {
          if (this instanceof C) {
            switch (arguments.length) {
              case 0: return new C();
              case 1: return new C(a);
              case 2: return new C(a, b);
            } return new C(a, b, c);
          } return C.apply(this, arguments);
        };
        F[PROTOTYPE] = C[PROTOTYPE];
        return F;
      // make static versions for prototype methods
      })(out) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
      // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
      if (IS_PROTO) {
        (exports.virtual || (exports.virtual = {}))[key] = out;
        // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
        if (type & $export.R && expProto && !expProto[key]) _hide(expProto, key, out);
      }
    }
  };
  // type bitmap
  $export.F = 1;   // forced
  $export.G = 2;   // global
  $export.S = 4;   // static
  $export.P = 8;   // proto
  $export.B = 16;  // bind
  $export.W = 32;  // wrap
  $export.U = 64;  // safe
  $export.R = 128; // real proto method for `library`
  var _export = $export;

  var _redefine = _hide;

  var _iterators = {};

  var toString = {}.toString;

  var _cof = function (it) {
    return toString.call(it).slice(8, -1);
  };

  // fallback for non-array-like ES3 and non-enumerable old V8 strings

  // eslint-disable-next-line no-prototype-builtins
  var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
    return _cof(it) == 'String' ? it.split('') : Object(it);
  };

  // to indexed object, toObject with fallback for non-array-like ES3 strings


  var _toIobject = function (it) {
    return _iobject(_defined(it));
  };

  // 7.1.15 ToLength

  var min = Math.min;
  var _toLength = function (it) {
    return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  };

  var max = Math.max;
  var min$1 = Math.min;
  var _toAbsoluteIndex = function (index, length) {
    index = _toInteger(index);
    return index < 0 ? max(index + length, 0) : min$1(index, length);
  };

  // false -> Array#indexOf
  // true  -> Array#includes



  var _arrayIncludes = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = _toIobject($this);
      var length = _toLength(O.length);
      var index = _toAbsoluteIndex(fromIndex, length);
      var value;
      // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare
      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++];
        // eslint-disable-next-line no-self-compare
        if (value != value) return true;
      // Array#indexOf ignores holes, Array#includes - not
      } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
        if (O[index] === el) return IS_INCLUDES || index || 0;
      } return !IS_INCLUDES && -1;
    };
  };

  var _shared = createCommonjsModule(function (module) {
  var SHARED = '__core-js_shared__';
  var store = _global[SHARED] || (_global[SHARED] = {});

  (module.exports = function (key, value) {
    return store[key] || (store[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: _core.version,
    mode: 'pure',
    copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
  });
  });

  var id = 0;
  var px = Math.random();
  var _uid = function (key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
  };

  var shared = _shared('keys');

  var _sharedKey = function (key) {
    return shared[key] || (shared[key] = _uid(key));
  };

  var arrayIndexOf = _arrayIncludes(false);
  var IE_PROTO = _sharedKey('IE_PROTO');

  var _objectKeysInternal = function (object, names) {
    var O = _toIobject(object);
    var i = 0;
    var result = [];
    var key;
    for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while (names.length > i) if (_has(O, key = names[i++])) {
      ~arrayIndexOf(result, key) || result.push(key);
    }
    return result;
  };

  // IE 8- don't enum bug keys
  var _enumBugKeys = (
    'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
  ).split(',');

  // 19.1.2.14 / 15.2.3.14 Object.keys(O)



  var _objectKeys = Object.keys || function keys(O) {
    return _objectKeysInternal(O, _enumBugKeys);
  };

  var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
    _anObject(O);
    var keys = _objectKeys(Properties);
    var length = keys.length;
    var i = 0;
    var P;
    while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
    return O;
  };

  var document$2 = _global.document;
  var _html = document$2 && document$2.documentElement;

  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



  var IE_PROTO$1 = _sharedKey('IE_PROTO');
  var Empty = function () { /* empty */ };
  var PROTOTYPE$1 = 'prototype';

  // Create object with fake `null` prototype: use iframe Object with cleared prototype
  var createDict = function () {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = _domCreate('iframe');
    var i = _enumBugKeys.length;
    var lt = '<';
    var gt = '>';
    var iframeDocument;
    iframe.style.display = 'none';
    _html.appendChild(iframe);
    iframe.src = 'javascript:'; // eslint-disable-line no-script-url
    // createDict = iframe.contentWindow.Object;
    // html.removeChild(iframe);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
    iframeDocument.close();
    createDict = iframeDocument.F;
    while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
    return createDict();
  };

  var _objectCreate = Object.create || function create(O, Properties) {
    var result;
    if (O !== null) {
      Empty[PROTOTYPE$1] = _anObject(O);
      result = new Empty();
      Empty[PROTOTYPE$1] = null;
      // add "__proto__" for Object.getPrototypeOf polyfill
      result[IE_PROTO$1] = O;
    } else result = createDict();
    return Properties === undefined ? result : _objectDps(result, Properties);
  };

  var _wks = createCommonjsModule(function (module) {
  var store = _shared('wks');

  var Symbol = _global.Symbol;
  var USE_SYMBOL = typeof Symbol == 'function';

  var $exports = module.exports = function (name) {
    return store[name] || (store[name] =
      USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
  };

  $exports.store = store;
  });

  var def = _objectDp.f;

  var TAG = _wks('toStringTag');

  var _setToStringTag = function (it, tag, stat) {
    if (it && !_has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
  };

  var IteratorPrototype = {};

  // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
  _hide(IteratorPrototype, _wks('iterator'), function () { return this; });

  var _iterCreate = function (Constructor, NAME, next) {
    Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
    _setToStringTag(Constructor, NAME + ' Iterator');
  };

  // 7.1.13 ToObject(argument)

  var _toObject = function (it) {
    return Object(_defined(it));
  };

  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


  var IE_PROTO$2 = _sharedKey('IE_PROTO');
  var ObjectProto = Object.prototype;

  var _objectGpo = Object.getPrototypeOf || function (O) {
    O = _toObject(O);
    if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
    if (typeof O.constructor == 'function' && O instanceof O.constructor) {
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectProto : null;
  };

  var ITERATOR = _wks('iterator');
  var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
  var FF_ITERATOR = '@@iterator';
  var KEYS = 'keys';
  var VALUES = 'values';

  var returnThis = function () { return this; };

  var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
    _iterCreate(Constructor, NAME, next);
    var getMethod = function (kind) {
      if (!BUGGY && kind in proto) return proto[kind];
      switch (kind) {
        case KEYS: return function keys() { return new Constructor(this, kind); };
        case VALUES: return function values() { return new Constructor(this, kind); };
      } return function entries() { return new Constructor(this, kind); };
    };
    var TAG = NAME + ' Iterator';
    var DEF_VALUES = DEFAULT == VALUES;
    var VALUES_BUG = false;
    var proto = Base.prototype;
    var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
    var $default = $native || getMethod(DEFAULT);
    var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
    var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
    var methods, key, IteratorPrototype;
    // Fix native
    if ($anyNative) {
      IteratorPrototype = _objectGpo($anyNative.call(new Base()));
      if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
        // Set @@toStringTag to native iterators
        _setToStringTag(IteratorPrototype, TAG, true);
      }
    }
    // fix Array#{values, @@iterator}.name in V8 / FF
    if (DEF_VALUES && $native && $native.name !== VALUES) {
      VALUES_BUG = true;
      $default = function values() { return $native.call(this); };
    }
    // Define iterator
    if ((FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
      _hide(proto, ITERATOR, $default);
    }
    // Plug for library
    _iterators[NAME] = $default;
    _iterators[TAG] = returnThis;
    if (DEFAULT) {
      methods = {
        values: DEF_VALUES ? $default : getMethod(VALUES),
        keys: IS_SET ? $default : getMethod(KEYS),
        entries: $entries
      };
      if (FORCED) for (key in methods) {
        if (!(key in proto)) _redefine(proto, key, methods[key]);
      } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
    }
    return methods;
  };

  var $at = _stringAt(true);

  // 21.1.3.27 String.prototype[@@iterator]()
  _iterDefine(String, 'String', function (iterated) {
    this._t = String(iterated); // target
    this._i = 0;                // next index
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
  }, function () {
    var O = this._t;
    var index = this._i;
    var point;
    if (index >= O.length) return { value: undefined, done: true };
    point = $at(O, index);
    this._i += point.length;
    return { value: point, done: false };
  });

  // call something on iterator step with safe closing on error

  var _iterCall = function (iterator, fn, value, entries) {
    try {
      return entries ? fn(_anObject(value)[0], value[1]) : fn(value);
    // 7.4.6 IteratorClose(iterator, completion)
    } catch (e) {
      var ret = iterator['return'];
      if (ret !== undefined) _anObject(ret.call(iterator));
      throw e;
    }
  };

  // check on default Array iterator

  var ITERATOR$1 = _wks('iterator');
  var ArrayProto = Array.prototype;

  var _isArrayIter = function (it) {
    return it !== undefined && (_iterators.Array === it || ArrayProto[ITERATOR$1] === it);
  };

  var _createProperty = function (object, index, value) {
    if (index in object) _objectDp.f(object, index, _propertyDesc(0, value));
    else object[index] = value;
  };

  // getting tag from 19.1.3.6 Object.prototype.toString()

  var TAG$1 = _wks('toStringTag');
  // ES3 wrong here
  var ARG = _cof(function () { return arguments; }()) == 'Arguments';

  // fallback for IE11 Script Access Denied error
  var tryGet = function (it, key) {
    try {
      return it[key];
    } catch (e) { /* empty */ }
  };

  var _classof = function (it) {
    var O, T, B;
    return it === undefined ? 'Undefined' : it === null ? 'Null'
      // @@toStringTag case
      : typeof (T = tryGet(O = Object(it), TAG$1)) == 'string' ? T
      // builtinTag case
      : ARG ? _cof(O)
      // ES3 arguments fallback
      : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
  };

  var ITERATOR$2 = _wks('iterator');

  var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
    if (it != undefined) return it[ITERATOR$2]
      || it['@@iterator']
      || _iterators[_classof(it)];
  };

  var ITERATOR$3 = _wks('iterator');
  var SAFE_CLOSING = false;

  try {
    var riter = [7][ITERATOR$3]();
    riter['return'] = function () { SAFE_CLOSING = true; };
  } catch (e) { /* empty */ }

  var _iterDetect = function (exec, skipClosing) {
    if (!skipClosing && !SAFE_CLOSING) return false;
    var safe = false;
    try {
      var arr = [7];
      var iter = arr[ITERATOR$3]();
      iter.next = function () { return { done: safe = true }; };
      arr[ITERATOR$3] = function () { return iter; };
      exec(arr);
    } catch (e) { /* empty */ }
    return safe;
  };

  _export(_export.S + _export.F * !_iterDetect(function (iter) { }), 'Array', {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
      var O = _toObject(arrayLike);
      var C = typeof this == 'function' ? this : Array;
      var aLen = arguments.length;
      var mapfn = aLen > 1 ? arguments[1] : undefined;
      var mapping = mapfn !== undefined;
      var index = 0;
      var iterFn = core_getIteratorMethod(O);
      var length, result, step, iterator;
      if (mapping) mapfn = _ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
      // if object isn't iterable or it's array with default iterator - use simple case
      if (iterFn != undefined && !(C == Array && _isArrayIter(iterFn))) {
        for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
          _createProperty(result, index, mapping ? _iterCall(iterator, mapfn, [step.value, index], true) : step.value);
        }
      } else {
        length = _toLength(O.length);
        for (result = new C(length); length > index; index++) {
          _createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
        }
      }
      result.length = index;
      return result;
    }
  });

  var from_1 = _core.Array.from;

  // 7.2.2 IsArray(argument)

  var _isArray = Array.isArray || function isArray(arg) {
    return _cof(arg) == 'Array';
  };

  // 22.1.2.2 / 15.4.3.2 Array.isArray(arg)


  _export(_export.S, 'Array', { isArray: _isArray });

  var isArray = _core.Array.isArray;

  var from = Array.from || from_1;
  var isArray$1 = Array.isArray || isArray; // --- Instance ---

  var arrayIncludes = function arrayIncludes(array, value) {
    return array.indexOf(value) !== -1;
  };
  var concat = function concat() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return Array.prototype.concat.apply([], args);
  };

  var f$1 = Object.getOwnPropertySymbols;

  var _objectGops = {
  	f: f$1
  };

  var f$2 = {}.propertyIsEnumerable;

  var _objectPie = {
  	f: f$2
  };

  // 19.1.2.1 Object.assign(target, source, ...)





  var $assign = Object.assign;

  // should work with symbols and should have deterministic property order (V8 bug)
  var _objectAssign = !$assign || _fails(function () {
    var A = {};
    var B = {};
    // eslint-disable-next-line no-undef
    var S = Symbol();
    var K = 'abcdefghijklmnopqrst';
    A[S] = 7;
    K.split('').forEach(function (k) { B[k] = k; });
    return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
  }) ? function assign(target, source) { // eslint-disable-line no-unused-vars
    var T = _toObject(target);
    var aLen = arguments.length;
    var index = 1;
    var getSymbols = _objectGops.f;
    var isEnum = _objectPie.f;
    while (aLen > index) {
      var S = _iobject(arguments[index++]);
      var keys = getSymbols ? _objectKeys(S).concat(getSymbols(S)) : _objectKeys(S);
      var length = keys.length;
      var j = 0;
      var key;
      while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
    } return T;
  } : $assign;

  // 19.1.3.1 Object.assign(target, source)


  _export(_export.S + _export.F, 'Object', { assign: _objectAssign });

  var assign = _core.Object.assign;

  // 7.2.9 SameValue(x, y)
  var _sameValue = Object.is || function is(x, y) {
    // eslint-disable-next-line no-self-compare
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  };

  // 19.1.3.10 Object.is(value1, value2)

  _export(_export.S, 'Object', { is: _sameValue });

  var is$1 = _core.Object.is;

  var assign$1 = Object.assign || assign;
  var keys = Object.keys;
  var defineProperties = Object.defineProperties;
  var defineProperty = Object.defineProperty;
  var create = Object.create;
  /**
   * Quick object check - this is primarily used to tell
   * Objects from primitive values when we know the value
   * is a JSON-compliant type.
   * Note object could be a complex type like array, date, etc.
   */

  var isObject = function isObject(obj) {
    return obj !== null && _typeof(obj) === 'object';
  };
  /**
   * Strict object type check. Only returns true
   * for plain JavaScript objects.
   */

  var isPlainObject = function isPlainObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }; // @link https://gist.github.com/bisubus/2da8af7e801ffd813fab7ac221aa7afc

  var omit = function omit(obj, props) {
    return keys(obj).filter(function (key) {
      return props.indexOf(key) === -1;
    }).reduce(function (result, key) {
      return _objectSpread({}, result, _defineProperty({}, key, obj[key]));
    }, {});
  };
  var readonlyDescriptor = function readonlyDescriptor() {
    return {
      enumerable: true,
      configurable: false,
      writable: false
    };
  };

  var toType = function toType(val) {
    return _typeof(val);
  };
  var toRawType = function toRawType(val) {
    return Object.prototype.toString.call(val).slice(8, -1);
  };
  var isUndefined = function isUndefined(val) {
    return val === undefined;
  };
  var isNull = function isNull(val) {
    return val === null;
  };
  var isFunction = function isFunction(val) {
    return toType(val) === 'function';
  };
  var isBoolean = function isBoolean(val) {
    return toType(val) === 'boolean';
  };
  var isString = function isString(val) {
    return toType(val) === 'string';
  };
  var isNumber = function isNumber(val) {
    return toType(val) === 'number';
  };
  var isDate = function isDate(val) {
    return val instanceof Date;
  };
  var isRegExp = function isRegExp(val) {
    return toRawType(val) === 'RegExp';
  };

  var cloneDeep = function cloneDeep(obj) {
    var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : obj;

    if (isArray$1(obj)) {
      return obj.reduce(function (result, val) {
        return [].concat(_toConsumableArray(result), [cloneDeep(val, val)]);
      }, []);
    }

    if (isPlainObject(obj)) {
      return keys(obj).reduce(function (result, key) {
        return _objectSpread({}, result, _defineProperty({}, key, cloneDeep(obj[key], obj[key])));
      }, {});
    }

    return defaultValue;
  };

  /**
   * Get property defined by dot/array notation in string.
   *
   * @link https://gist.github.com/jeneg/9767afdcca45601ea44930ea03e0febf#gistcomment-1935901
   *
   * @param {Object} obj
   * @param {string|Array} path
   * @param {*} defaultValue (optional)
   * @return {*}
   */

  var get = function get(obj, path) {
    var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    // Handle array of path values
    path = isArray$1(path) ? path.join('.') : path; // If no path or no object passed

    if (!path || !isObject(obj)) {
      return defaultValue;
    } // Handle edge case where user has dot(s) in top-level item field key
    // See https://github.com/bootstrap-vue/bootstrap-vue/issues/2762


    if (obj.hasOwnProperty(path)) {
      return obj[path];
    } // Handle string array notation (numeric indices only)


    path = String(path).replace(/\[(\d+)]/g, '.$1');
    var steps = path.split('.').filter(Boolean); // Handle case where someone passes a string of only dots

    if (steps.length === 0) {
      return defaultValue;
    } // Traverse path in object to find result


    return steps.every(function (step) {
      return isObject(obj) && obj.hasOwnProperty(step) && (obj = obj[step]) != null;
    }) ? obj : defaultValue;
  };

  var memoize = function memoize(fn) {
    var cache = create(null);
    return function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var argsKey = JSON.stringify(args);
      return cache[argsKey] = cache[argsKey] || fn.apply(null, args);
    };
  };

  /**
   * Utilities to get information about the current environment
   */
  // --- Constants ---
  var hasWindowSupport = typeof window !== 'undefined';
  var hasDocumentSupport = typeof document !== 'undefined';
  var hasNavigatorSupport = typeof navigator !== 'undefined';
  var hasPromiseSupport = typeof Promise !== 'undefined';
  var hasMutationObserverSupport = typeof MutationObserver !== 'undefined' || typeof WebKitMutationObserver !== 'undefined' || typeof MozMutationObserver !== 'undefined';
  var isBrowser = hasWindowSupport && hasDocumentSupport && hasNavigatorSupport; // Determine if the browser supports the option passive for events

  var hasPassiveEventSupport = function () {
    var passiveEventSupported = false;

    if (isBrowser) {
      try {
        var options = {
          get passive() {
            // This function will be called when the browser
            // attempts to access the passive property.

            /* istanbul ignore next: will never be called in JSDOM */
            passiveEventSupported = true;
          }

        };
        window.addEventListener('test', options, options);
        window.removeEventListener('test', options, options);
      } catch (err) {
        /* istanbul ignore next: will never be called in JSDOM */
        passiveEventSupported = false;
      }
    }

    return passiveEventSupported;
  }();
  var hasTouchSupport = isBrowser && ('ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0);
  var hasPointerEventSupport = isBrowser && Boolean(window.PointerEvent || window.MSPointerEvent); // --- Getters ---

  var getEnv = function getEnv(key) {
    var fallback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var env = typeof process !== 'undefined' && process ? process.env || {} : {};

    if (!key) {
      /* istanbul ignore next */
      return env;
    }

    return env[key] || fallback;
  };
  var getNoWarn = function getNoWarn() {
    return getEnv('BOOTSTRAP_VUE_NO_WARN');
  };

  /**
   * Log a warning message to the console with BootstrapVue formatting
   * @param {string} message
   */

  var warn = function warn(message)
  /* istanbul ignore next */
  {
    if (!getNoWarn()) {
      console.warn("[BootstrapVue warn]: ".concat(message));
    }
  };
  /**
   * Warn when no Promise support is given
   * @param {string} source
   * @returns {boolean} warned
   */


  var warnNotClient = function warnNotClient(source) {
    /* istanbul ignore else */
    if (isBrowser) {
      return false;
    } else {
      warn("".concat(source, ": Can not be called during SSR."));
      return true;
    }
  };
  /**
   * Warn when no Promise support is given
   * @param {string} source
   * @returns {boolean} warned
   */

  var warnNoPromiseSupport = function warnNoPromiseSupport(source) {
    /* istanbul ignore else */
    if (hasPromiseSupport) {
      return false;
    } else {
      warn("".concat(source, ": Requires Promise support."));
      return true;
    }
  };
  /**
   * Warn when no MutationObserver support is given
   * @param {string} source
   * @returns {boolean} warned
   */

  var warnNoMutationObserverSupport = function warnNoMutationObserverSupport(source) {
    /* istanbul ignore else */
    if (hasMutationObserverSupport) {
      return false;
    } else {
      warn("".concat(source, ": Requires MutationObserver support."));
      return true;
    }
  }; // Default export

  //
  // BREAKPOINT DEFINITIONS
  //
  // Some components (BCol and BFormGroup) generate props based on breakpoints, and this
  // occurs when the component is first loaded (evaluated), which may happen before the
  // config is created/modified
  //
  // To get around this we make these components async (lazy evaluation)
  // The component definition is only called/executed when the first access to the
  // component is used (and cached on subsequent uses)
  //
  // See: https://vuejs.org/v2/guide/components-dynamic-async.html#Async-Components
  //
  // PROP DEFAULTS
  //
  // For default values on props, we use the default value factory function approach so
  // so that the default values are pulled in at each component instantiation
  //
  //  props: {
  //    variant: {
  //      type: String,
  //      default: () => getConfigComponent('BAlert', 'variant')
  //    }
  //  }
  // prettier-ignore

  var DEFAULTS = {
    // Breakpoints
    breakpoints: ['xs', 'sm', 'md', 'lg', 'xl'],
    // Component Specific defaults are keyed by the component
    // name (PascalCase) and prop name (camelCase)
    BAlert: {
      dismissLabel: 'Close',
      variant: 'info'
    },
    BBadge: {
      variant: 'secondary'
    },
    BButton: {
      variant: 'secondary'
    },
    BButtonClose: {
      // `textVariant` is `null` to inherit the current text color
      textVariant: null,
      ariaLabel: 'Close'
    },
    BCardSubTitle: {
      // BCard and BCardBody also inherit this prop
      subTitleTextVariant: 'muted'
    },
    BCarousel: {
      labelPrev: 'Previous Slide',
      labelNext: 'Next Slide',
      labelGotoSlide: 'Goto Slide',
      labelIndicators: 'Select a slide to display'
    },
    BDropdown: {
      toggleText: 'Toggle Dropdown',
      variant: 'secondary'
    },
    BFormFile: {
      browseText: 'Browse',
      // Chrome default file prompt
      placeholder: 'No file chosen',
      dropPlaceholder: 'Drop files here'
    },
    BFormText: {
      textVariant: 'muted'
    },
    BImg: {
      blankColor: 'transparent'
    },
    BImgLazy: {
      blankColor: 'transparent'
    },
    BModal: {
      cancelTitle: 'Cancel',
      cancelVariant: 'secondary',
      okTitle: 'OK',
      okVariant: 'primary',
      headerCloseLabel: 'Close'
    },
    BNavbarToggle: {
      label: 'Toggle navigation'
    },
    BToast: {
      toaster: 'b-toaster-top-right'
    } // This contains user defined configuration

  };
  var CONFIG = {}; // Method to get a deep clone (immutable) copy of the defaults

  var getDefaults = function getDefaults() {
    return cloneDeep(DEFAULTS);
  }; // Method to set the config
  // Merges in only known top-level and sub-level keys
  //   Vue.use(BootstrapVue, config)
  // or
  //   BootstrapVue.setConfig(config)
  //   Vue.use(BootstrapVue)


  var setConfig = function setConfig() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!isObject(config)) {
      /* istanbul ignore next */
      return;
    }

    keys(config).filter(function (cmpName) {
      return config.hasOwnProperty(cmpName);
    }).forEach(function (cmpName) {
      if (!DEFAULTS.hasOwnProperty(cmpName)) {
        /* istanbul ignore next */
        warn("config: unknown config property \"".concat(cmpName, "\""));
        /* istanbul ignore next */

        return;
      }

      var cmpConfig = config[cmpName];

      if (cmpName === 'breakpoints') {
        // Special case for breakpoints
        var breakpoints = config.breakpoints;

        if (!isArray$1(breakpoints) || breakpoints.length < 2 || breakpoints.some(function (b) {
          return !isString(b) || b.length === 0;
        })) {
          /* istanbul ignore next */
          warn('config: "breakpoints" must be an array of at least 2 breakpoint names');
        } else {
          CONFIG.breakpoints = cloneDeep(breakpoints);
        }
      } else if (isObject(cmpConfig)) {
        keys(cmpConfig).filter(function (key) {
          return cmpConfig.hasOwnProperty(key);
        }).forEach(function (key) {
          if (!DEFAULTS[cmpName].hasOwnProperty(key)) {
            /* istanbul ignore next */
            warn("config: unknown config property \"".concat(cmpName, ".{$key}\""));
          } else {
            // If we pre-populate the config with defaults, we can skip this line
            CONFIG[cmpName] = CONFIG[cmpName] || {};

            if (!isUndefined(cmpConfig[key])) {
              CONFIG[cmpName][key] = cloneDeep(cmpConfig[key]);
            }
          }
        });
      }
    });
  }; // Reset the user config to default
  // Returns a deep clone (immutable) copy


  var getConfigValue = function getConfigValue(key) {
    // First we try the user config, and if key not found we fall back to default value
    // NOTE: If we deep clone DEFAULTS into config, then we can skip the fallback for get
    return cloneDeep(get(CONFIG, key, get(getDefaults(), key)));
  }; // Method to grab a config value for a particular component.
  // Returns a deep clone (immutable) copy


  var getComponentConfig = function getComponentConfig(cmpName) {
    var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    // Return the particular config value for key for if specified,
    // otherwise we return the full config
    return key ? getConfigValue("".concat(cmpName, ".").concat(key)) : getConfigValue(cmpName) || {};
  }; // Convenience method for getting all breakpoint names


  var getBreakpoints = function getBreakpoints() {
    return getConfigValue('breakpoints');
  }; // Convenience method for getting all breakpoint names
  // Caches the results after first access


  var getBreakpointsCached = memoize(function () {
    return getConfigValue('breakpoints');
  }); // Convenience method for getting breakpoints with
  // the smallest breakpoint set as ''
  // Useful for components that create breakpoint specific props
  // Caches the results after first access


  var getBreakpointsUpCached = memoize(function () {
    var breakpoints = getBreakpointsCached().slice();
    breakpoints[0] = '';
    return breakpoints;
  }); // Convenience method for getting breakpoints with

  var w = hasWindowSupport ? window : {};
  var d = hasDocumentSupport ? document : {};
  var elProto = typeof Element !== 'undefined' ? Element.prototype : {}; // --- Normalization utils ---
  // See: https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill

  /* istanbul ignore next */

  var matchesEl = elProto.matches || elProto.msMatchesSelector || elProto.webkitMatchesSelector; // See: https://developer.mozilla.org/en-US/docs/Web/API/Element/closest

  /* istanbul ignore next */

  var closestEl = elProto.closest || function (sel)
  /* istanbul ignore next */
  {
    var el = this;

    do {
      // Use our "patched" matches function
      if (matches(el, sel)) {
        return el;
      }

      el = el.parentElement || el.parentNode;
    } while (!isNull(el) && el.nodeType === Node.ELEMENT_NODE);

    return null;
  }; // `requestAnimationFrame()` convenience method
  // We don't have a version for cancelAnimationFrame, but we don't call it anywhere

  var requestAF = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.mozRequestAnimationFrame || w.msRequestAnimationFrame || w.oRequestAnimationFrame || function (cb) {
    // Fallback, but not a true polyfill
    // All browsers we support (other than Opera Mini) support
    // `requestAnimationFrame()` without a polyfill

    /* istanbul ignore next */
    return setTimeout(cb, 16);
  };
  var MutationObs = w.MutationObserver || w.WebKitMutationObserver || w.MozMutationObserver || null; // --- Utils ---
  // Normalize event options based on support of passive option
  // Exported only for testing purposes

  var parseEventOptions = function parseEventOptions(options) {
    if (!hasPassiveEventSupport) {
      // Need to translate to actual Boolean value
      return Boolean(isObject(options) ? options.useCapture : options);
    }

    return isObject(options) ? options : {
      useCapture: Boolean(options || false)
    };
  }; // Attach an event listener to an element

  var eventOn = function eventOn(el, evtName, handler, options) {
    if (el && el.addEventListener) {
      el.addEventListener(evtName, handler, parseEventOptions(options));
    }
  }; // Remove an event listener from an element

  var eventOff = function eventOff(el, evtName, handler, options) {
    if (el && el.removeEventListener) {
      el.removeEventListener(evtName, handler, parseEventOptions(options));
    }
  }; // Determine if an element is an HTML Element

  var isElement = function isElement(el) {
    return Boolean(el && el.nodeType === Node.ELEMENT_NODE);
  }; // Determine if an HTML element is visible - Faster than CSS check

  var isVisible = function isVisible(el) {
    if (!isElement(el) || !contains(d.body, el)) {
      return false;
    }

    if (el.style.display === 'none') {
      // We do this check to help with vue-test-utils when using v-show

      /* istanbul ignore next */
      return false;
    } // All browsers support getBoundingClientRect(), except JSDOM as it returns all 0's for values :(
    // So any tests that need isVisible will fail in JSDOM
    // Except when we override the getBCR prototype in some tests


    var bcr = getBCR(el);
    return Boolean(bcr && bcr.height > 0 && bcr.width > 0);
  }; // Determine if an element is disabled

  var isDisabled = function isDisabled(el) {
    return !isElement(el) || el.disabled || Boolean(getAttr(el, 'disabled')) || hasClass(el, 'disabled');
  }; // Cause/wait-for an element to reflow it's content (adjusting it's height/width)

  var reflow = function reflow(el) {
    // Requesting an elements offsetHight will trigger a reflow of the element content

    /* istanbul ignore next: reflow doesn't happen in JSDOM */
    return isElement(el) && el.offsetHeight;
  }; // Select all elements matching selector. Returns `[]` if none found

  var selectAll = function selectAll(selector, root) {
    return from((isElement(root) ? root : d).querySelectorAll(selector));
  }; // Select a single element, returns `null` if not found

  var select = function select(selector, root) {
    return (isElement(root) ? root : d).querySelector(selector) || null;
  }; // Determine if an element matches a selector

  var matches = function matches(el, selector) {
    if (!isElement(el)) {
      return false;
    }

    return matchesEl.call(el, selector);
  }; // Finds closest element matching selector. Returns `null` if not found

  var closest = function closest(selector, root) {
    if (!isElement(root)) {
      return null;
    }

    var el = closestEl.call(root, selector); // Emulate jQuery closest and return `null` if match is the passed in element (root)

    return el === root ? null : el;
  }; // Returns true if the parent element contains the child element

  var contains = function contains(parent, child) {
    if (!parent || !isFunction(parent.contains)) {
      return false;
    }

    return parent.contains(child);
  }; // Get an element given an ID

  var getById = function getById(id) {
    return d.getElementById(/^#/.test(id) ? id.slice(1) : id) || null;
  }; // Add a class to an element

  var addClass = function addClass(el, className) {
    // We are checking for `el.classList` existence here since IE 11
    // returns `undefined` for some elements (e.g. SVG elements)
    // See https://github.com/bootstrap-vue/bootstrap-vue/issues/2713
    if (className && isElement(el) && el.classList) {
      el.classList.add(className);
    }
  }; // Remove a class from an element

  var removeClass = function removeClass(el, className) {
    // We are checking for `el.classList` existence here since IE 11
    // returns `undefined` for some elements (e.g. SVG elements)
    // See https://github.com/bootstrap-vue/bootstrap-vue/issues/2713
    if (className && isElement(el) && el.classList) {
      el.classList.remove(className);
    }
  }; // Test if an element has a class

  var hasClass = function hasClass(el, className) {
    // We are checking for `el.classList` existence here since IE 11
    // returns `undefined` for some elements (e.g. SVG elements)
    // See https://github.com/bootstrap-vue/bootstrap-vue/issues/2713
    if (className && isElement(el) && el.classList) {
      return el.classList.contains(className);
    }

    return false;
  }; // Set an attribute on an element

  var setAttr = function setAttr(el, attr, value) {
    if (attr && isElement(el)) {
      el.setAttribute(attr, value);
    }
  }; // Remove an attribute from an element

  var removeAttr = function removeAttr(el, attr) {
    if (attr && isElement(el)) {
      el.removeAttribute(attr);
    }
  }; // Get an attribute value from an element
  // Returns `null` if not found

  var getAttr = function getAttr(el, attr) {
    return attr && isElement(el) ? el.getAttribute(attr) : null;
  }; // Determine if an attribute exists on an element
  // Returns `true` or `false`, or `null` if element not found

  var hasAttr = function hasAttr(el, attr) {
    return attr && isElement(el) ? el.hasAttribute(attr) : null;
  }; // Return the Bounding Client Rect of an element
  // Returns `null` if not an element

  /* istanbul ignore next: getBoundingClientRect() doesn't work in JSDOM */

  var getBCR = function getBCR(el) {
    return isElement(el) ? el.getBoundingClientRect() : null;
  }; // Get computed style object for an element

  /* istanbul ignore next: getComputedStyle() doesn't work in JSDOM */

  var getCS = function getCS(el) {
    return hasWindowSupport && isElement(el) ? w.getComputedStyle(el) : {};
  }; // Return an element's offset with respect to document element
  // https://j11y.io/jquery/#v=git&fn=jQuery.fn.offset

  var offset = function offset(el)
  /* istanbul ignore next: getBoundingClientRect(), getClientRects() doesn't work in JSDOM */
  {
    var _offset = {
      top: 0,
      left: 0
    };

    if (!isElement(el) || el.getClientRects().length === 0) {
      return _offset;
    }

    var bcr = getBCR(el);

    if (bcr) {
      var win = el.ownerDocument.defaultView;
      _offset.top = bcr.top + win.pageYOffset;
      _offset.left = bcr.left + win.pageXOffset;
    }

    return _offset;
  }; // Return an element's offset with respect to to it's offsetParent
  // https://j11y.io/jquery/#v=git&fn=jQuery.fn.position

  var position = function position(el)
  /* istanbul ignore next: getBoundingClientRect() doesn't work in JSDOM */
  {
    var _offset = {
      top: 0,
      left: 0
    };

    if (!isElement(el)) {
      return _offset;
    }

    var parentOffset = {
      top: 0,
      left: 0
    };
    var elStyles = getCS(el);

    if (elStyles.position === 'fixed') {
      _offset = getBCR(el) || _offset;
    } else {
      _offset = offset(el);
      var doc = el.ownerDocument;
      var offsetParent = el.offsetParent || doc.documentElement;

      while (offsetParent && (offsetParent === doc.body || offsetParent === doc.documentElement) && getCS(offsetParent).position === 'static') {
        offsetParent = offsetParent.parentNode;
      }

      if (offsetParent && offsetParent !== el && offsetParent.nodeType === Node.ELEMENT_NODE) {
        parentOffset = offset(offsetParent);
        var offsetParentStyles = getCS(offsetParent);
        parentOffset.top += parseFloat(offsetParentStyles.borderTopWidth);
        parentOffset.left += parseFloat(offsetParentStyles.borderLeftWidth);
      }
    }

    return {
      top: _offset.top - parentOffset.top - parseFloat(elStyles.marginTop),
      left: _offset.left - parentOffset.left - parseFloat(elStyles.marginLeft)
    };
  };

  var __assign=function(){return (__assign=Object.assign||function(e){for(var a,s=1,t=arguments.length;s<t;s++)for(var r in a=arguments[s])Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r]);return e}).apply(this,arguments)};function mergeData(){for(var e,a,s={},t=arguments.length;t--;)for(var r=0,c=Object.keys(arguments[t]);r<c.length;r++)switch(e=c[r]){case"class":case"style":case"directives":Array.isArray(s[e])||(s[e]=[]),s[e]=s[e].concat(arguments[t][e]);break;case"staticClass":if(!arguments[t][e])break;void 0===s[e]&&(s[e]=""),s[e]&&(s[e]+=" "),s[e]+=arguments[t][e].trim();break;case"on":case"nativeOn":s[e]||(s[e]={});for(var n=0,o=Object.keys(arguments[t][e]||{});n<o.length;n++)a=o[n],s[e][a]?s[e][a]=[].concat(s[e][a],arguments[t][e][a]):s[e][a]=arguments[t][e][a];break;case"attrs":case"props":case"domProps":case"scopedSlots":case"staticStyle":case"hook":case"transition":s[e]||(s[e]={}),s[e]=__assign({},arguments[t][e],s[e]);break;case"slot":case"key":case"ref":case"tag":case"show":case"keepAlive":default:s[e]||(s[e]=arguments[t][e]);}return s}

  var NAME = 'BButtonClose';
  var props = {
    disabled: {
      type: Boolean,
      default: false
    },
    ariaLabel: {
      type: String,
      default: function _default() {
        return String(getComponentConfig(NAME, 'ariaLabel'));
      }
    },
    textVariant: {
      type: String,
      default: function _default() {
        return String(getComponentConfig(NAME, 'textVariant') || '') || null;
      }
    } // @vue/component

  };
  var BButtonClose = Vue.extend({
    name: NAME,
    functional: true,
    props: props,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          listeners = _ref.listeners,
          slots = _ref.slots;
      var componentData = {
        staticClass: 'close',
        class: _defineProperty({}, "text-".concat(props.textVariant), props.textVariant),
        attrs: {
          type: 'button',
          disabled: props.disabled,
          'aria-label': props.ariaLabel ? String(props.ariaLabel) : null
        },
        on: {
          click: function click(e) {
            // Ensure click on button HTML content is also disabled

            /* istanbul ignore if: bug in JSDOM still emits click on inner element */
            if (props.disabled && e instanceof Event) {
              e.stopPropagation();
              e.preventDefault();
            }
          }
        } // Careful not to override the default slot with innerHTML

      };

      if (!slots().default) {
        componentData.domProps = {
          innerHTML: '&times;'
        };
      }

      return h('button', mergeData(data, componentData), slots().default);
    }
  });

  var NAME$1 = 'BAlert'; // Convert `show` value to a number

  var parseCountDown = function parseCountDown(show) {
    if (show === '' || isBoolean(show)) {
      return 0;
    }

    show = parseInt(show, 10);
    return show > 0 ? show : 0;
  }; // Convert `show` value to a boolean


  var parseShow = function parseShow(show) {
    if (show === '' || show === true) {
      return true;
    }

    if (parseInt(show, 10) < 1) {
      // Boolean will always return false for the above comparison
      return false;
    }

    return Boolean(show);
  }; // Is a value number like (i.e. a number or a number as string)


  var isNumericLike = function isNumericLike(value) {
    return !isNaN(parseInt(value, 10));
  }; // @vue/component


  var BAlert = Vue.extend({
    name: NAME$1,
    model: {
      prop: 'show',
      event: 'input'
    },
    props: {
      variant: {
        type: String,
        default: function _default() {
          return String(getComponentConfig(NAME$1, 'variant'));
        }
      },
      dismissible: {
        type: Boolean,
        default: false
      },
      dismissLabel: {
        type: String,
        default: function _default() {
          return String(getComponentConfig(NAME$1, 'dismissLabel'));
        }
      },
      show: {
        type: [Boolean, Number, String],
        default: false
      },
      fade: {
        type: Boolean,
        default: false
      }
    },
    data: function data() {
      return {
        countDownTimerId: null,
        countDown: 0,
        // If initially shown, we need to set these for SSR
        localShow: parseShow(this.show),
        showClass: this.fade && this.show
      };
    },
    watch: {
      show: function show(newVal) {
        this.countDown = parseCountDown(newVal);
        this.localShow = parseShow(newVal);
      },
      countDown: function countDown(newVal) {
        var _this = this;

        this.clearTimer();
        this.$emit('dismiss-count-down', newVal);

        if (this.show !== newVal) {
          // Update the v-model if needed
          this.$emit('input', newVal);
        }

        if (newVal > 0) {
          this.localShow = true;
          this.countDownTimerId = setTimeout(function () {
            _this.countDown--;
          }, 1000);
        } else {
          // Slightly delay the hide to allow any UI updates
          this.$nextTick(function () {
            requestAF(function () {
              _this.localShow = false;
            });
          });
        }
      },
      localShow: function localShow(newVal) {
        if (!newVal && (this.dismissible || isNumericLike(this.show))) {
          // Only emit dismissed events for dismissible or auto dismissing alerts
          this.$emit('dismissed');
        }

        if (!isNumericLike(this.show) && this.show !== newVal) {
          // Only emit booleans if we weren't passed a number via `this.show`
          this.$emit('input', newVal);
        }
      }
    },
    created: function created() {
      this.countDown = parseCountDown(this.show);
      this.localShow = parseShow(this.show);
    },
    mounted: function mounted() {
      this.countDown = parseCountDown(this.show);
      this.localShow = parseShow(this.show);
    },
    beforeDestroy: function beforeDestroy() {
      this.clearTimer();
    },
    methods: {
      dismiss: function dismiss() {
        this.clearTimer();
        this.countDown = 0;
        this.localShow = false;
      },
      clearTimer: function clearTimer() {
        if (this.countDownTimerId) {
          clearInterval(this.countDownTimerId);
          this.countDownTimerId = null;
        }
      },
      onBeforeEnter: function onBeforeEnter() {
        var _this2 = this;

        if (this.fade) {
          requestAF(function () {
            _this2.showClass = true;
          });
        }
      },
      onBeforeLeave: function onBeforeLeave()
      /* istanbul ignore next: does not appear to be called in vue-test-utils */
      {
        this.showClass = false;
      }
    },
    render: function render(h) {
      var $slots = this.$slots;
      var $alert; // undefined

      if (this.localShow) {
        var $dismissBtn = h(false);

        if (this.dismissible) {
          // Add dismiss button
          $dismissBtn = h(BButtonClose, {
            attrs: {
              'aria-label': this.dismissLabel
            },
            on: {
              click: this.dismiss
            }
          }, [$slots.dismiss]);
        }

        $alert = h('div', {
          staticClass: 'alert',
          class: _defineProperty({
            fade: this.fade,
            show: this.showClass,
            'alert-dismissible': this.dismissible
          }, "alert-".concat(this.variant), this.variant),
          attrs: {
            role: 'alert',
            'aria-live': 'polite',
            'aria-atomic': true
          }
        }, [$dismissBtn, $slots.default]);
        $alert = [$alert];
      }

      return h('transition', {
        props: {
          'enter-class': '',
          'enter-active-class': '',
          'enter-to-class': '',
          'leave-class': 'show',
          'leave-active-class': '',
          'leave-to-class': ''
        },
        on: {
          beforeEnter: this.onBeforeEnter,
          beforeLeave: this.onBeforeLeave
        }
      }, $alert);
    }
  });

  /**
   * Plugin install factory function.
   * @param {object} { components, directives }
   * @returns {function} plugin install function
   */

  var installFactory = function installFactory(_ref) {
    var components = _ref.components,
        directives = _ref.directives,
        plugins = _ref.plugins;

    var install = function install(Vue) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (install.installed) {
        /* istanbul ignore next */
        return;
      }

      install.installed = true;
      setConfig(config);
      registerComponents(Vue, components);
      registerDirectives(Vue, directives);
      registerPlugins(Vue, plugins);
    };

    install.installed = false;
    return install;
  };
  /**
   * Load a group of plugins.
   * @param {object} Vue
   * @param {object} Plugin definitions
   */

  var registerPlugins = function registerPlugins(Vue) {
    var plugins = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    for (var plugin in plugins) {
      if (plugin && plugins[plugin]) {
        Vue.use(plugins[plugin]);
      }
    }
  };
  /**
   * Load a component.
   * @param {object} Vue
   * @param {string} Component name
   * @param {object} Component definition
   */

  var registerComponent = function registerComponent(Vue, name, def) {
    if (Vue && name && def) {
      Vue.component(name, def);
    }
  };
  /**
   * Load a group of components.
   * @param {object} Vue
   * @param {object} Object of component definitions
   */

  var registerComponents = function registerComponents(Vue) {
    var components = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    for (var component in components) {
      registerComponent(Vue, component, components[component]);
    }
  };
  /**
   * Load a directive.
   * @param {object} Vue
   * @param {string} Directive name
   * @param {object} Directive definition
   */

  var registerDirective = function registerDirective(Vue, name, def) {
    if (Vue && name && def) {
      Vue.directive(name, def);
    }
  };
  /**
   * Load a group of directives.
   * @param {object} Vue
   * @param {object} Object of directive definitions
   */

  var registerDirectives = function registerDirectives(Vue) {
    var directives = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    for (var directive in directives) {
      registerDirective(Vue, directive, directives[directive]);
    }
  };
  /**
   * Install plugin if window.Vue available
   * @param {object} Plugin definition
   */

  var vueUse = function vueUse(VuePlugin) {
    /* istanbul ignore next */
    if (hasWindowSupport && window.Vue) {
      window.Vue.use(VuePlugin);
    }
  };

  var components = {
    BAlert: BAlert
  };
  var index = {
    install: installFactory({
      components: components
    })
  };

  var identity = function identity(x) {
    return x;
  };

  /**
   * Given an array of properties or an object of property keys,
   * plucks all the values off the target object, returning a new object
   * that has props that reference the original prop values
   *
   * @param {{}|string[]} keysToPluck
   * @param {{}} objToPluck
   * @param {Function} transformFn
   * @return {{}}
   */

  var pluckProps = function pluckProps(keysToPluck, objToPluck) {
    var transformFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : identity;
    return (isArray$1(keysToPluck) ? keysToPluck.slice() : keys(keysToPluck)).reduce(function (memo, prop) {
      memo[transformFn(prop)] = objToPluck[prop];
      return memo;
    }, {});
  };

  /**
   * Convert a value to a string that can be rendered.
   */

  var toString$1 = function toString(val) {
    var spaces = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
    return isUndefined(val) || isNull(val) ? '' : isArray$1(val) || isPlainObject(val) && val.toString === Object.prototype.toString ? JSON.stringify(val, null, spaces) : String(val);
  };

  var ANCHOR_TAG = 'a'; // Precompile RegExp

  var commaRE = /%2C/g;
  var encodeReserveRE = /[!'()*]/g; // Method to replace reserved chars

  var encodeReserveReplacer = function encodeReserveReplacer(c) {
    return '%' + c.charCodeAt(0).toString(16);
  }; // Fixed encodeURIComponent which is more conformant to RFC3986:
  // - escapes [!'()*]
  // - preserve commas


  var encode = function encode(str) {
    return encodeURIComponent(toString$1(str)).replace(encodeReserveRE, encodeReserveReplacer).replace(commaRE, ',');
  };

  var decode = decodeURIComponent; // Stringifies an object of query parameters
  // See: https://github.com/vuejs/vue-router/blob/dev/src/util/query.js

  var stringifyQueryObj = function stringifyQueryObj(obj) {
    if (!isPlainObject(obj)) {
      return '';
    }

    var query = keys(obj).map(function (key) {
      var val = obj[key];

      if (isUndefined(val)) {
        return '';
      } else if (isNull(val)) {
        return encode(key);
      } else if (isArray$1(val)) {
        return val.reduce(function (results, val2) {
          if (isNull(val2)) {
            results.push(encode(key));
          } else if (!isUndefined(val2)) {
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
  var parseQuery = function parseQuery(query) {
    var parsed = {};
    query = toString$1(query).trim().replace(/^(\?|#|&)/, '');

    if (!query) {
      return parsed;
    }

    query.split('&').forEach(function (param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = decode(parts.shift());
      var val = parts.length > 0 ? decode(parts.join('=')) : null;

      if (isUndefined(parsed[key])) {
        parsed[key] = val;
      } else if (isArray$1(parsed[key])) {
        parsed[key].push(val);
      } else {
        parsed[key] = [parsed[key], val];
      }
    });
    return parsed;
  };
  var isRouterLink = function isRouterLink(tag) {
    return tag !== ANCHOR_TAG;
  };
  var computeTag = function computeTag() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        to = _ref.to,
        disabled = _ref.disabled;

    var thisOrParent = arguments.length > 1 ? arguments[1] : undefined;
    return thisOrParent.$router && to && !disabled ? thisOrParent.$nuxt ? 'nuxt-link' : 'router-link' : ANCHOR_TAG;
  };
  var computeRel = function computeRel() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        target = _ref2.target,
        rel = _ref2.rel;

    if (target === '_blank' && isNull(rel)) {
      return 'noopener';
    }

    return rel || null;
  };
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
      if (isString(to)) {
        return to || toFallback;
      } // Fallback to `to.path + to.query + to.hash` prop (if `to` is an object)


      if (isPlainObject(to) && (to.path || to.query || to.hash)) {
        var path = toString$1(to.path);
        var query = stringifyQueryObj(to.query);
        var hash = toString$1(to.hash);
        hash = !hash || hash.charAt(0) === '#' ? hash : "#".concat(hash);
        return "".concat(path).concat(query).concat(hash) || toFallback;
      }
    } // If nothing is provided return the fallback


    return fallback;
  };

  /**
   * The Link component is used in many other BV components.
   * As such, sharing its props makes supporting all its features easier.
   * However, some components need to modify the defaults for their own purpose.
   * Prefer sharing a fresh copy of the props to ensure mutations
   * do not affect other component references to the props.
   *
   * https://github.com/vuejs/vue-router/blob/dev/src/components/link.js
   * @return {{}}
   */

  var propsFactory = function propsFactory() {
    return {
      href: {
        type: String,
        default: null
      },
      rel: {
        type: String,
        default: null
      },
      target: {
        type: String,
        default: '_self'
      },
      active: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      // router-link specific props
      to: {
        type: [String, Object],
        default: null
      },
      append: {
        type: Boolean,
        default: false
      },
      replace: {
        type: Boolean,
        default: false
      },
      event: {
        type: [String, Array],
        default: 'click'
      },
      activeClass: {
        type: String // default: undefined

      },
      exact: {
        type: Boolean,
        default: false
      },
      exactActiveClass: {
        type: String // default: undefined

      },
      routerTag: {
        type: String,
        default: 'a'
      },
      // nuxt-link specific prop(s)
      noPrefetch: {
        type: Boolean,
        default: false
      }
    };
  };

  var clickHandlerFactory = function clickHandlerFactory(_ref) {
    var disabled = _ref.disabled,
        tag = _ref.tag,
        href = _ref.href,
        suppliedHandler = _ref.suppliedHandler,
        parent = _ref.parent;
    return function onClick(evt) {
      var _arguments = arguments;

      if (disabled && evt instanceof Event) {
        // Stop event from bubbling up.
        evt.stopPropagation(); // Kill the event loop attached to this specific EventTarget.
        // Needed to prevent vue-router for doing its thing

        evt.stopImmediatePropagation();
      } else {
        if (isRouterLink(tag) && evt.target.__vue__) {
          // Router links do not emit instance 'click' events, so we
          // add in an $emit('click', evt) on it's vue instance

          /* istanbul ignore next: difficult to test, but we know it works */
          evt.target.__vue__.$emit('click', evt);
        } // Call the suppliedHandler(s), if any provided


        concat(suppliedHandler).filter(function (h) {
          return isFunction(h);
        }).forEach(function (handler) {
          handler.apply(void 0, _toConsumableArray(_arguments));
        });
        parent.$root.$emit('clicked::link', evt);
      }

      if (!isRouterLink(tag) && href === '#' || disabled) {
        // Stop scroll-to-top behavior or navigation on regular links
        // when href is just '#'
        evt.preventDefault();
      }
    };
  }; // @vue/component


  var BLink = Vue.extend({
    name: 'BLink',
    functional: true,
    props: propsFactory(),
    render: function render(h, _ref2) {
      var props = _ref2.props,
          data = _ref2.data,
          parent = _ref2.parent,
          children = _ref2.children;
      var tag = computeTag(props, parent);
      var rel = computeRel(props);
      var href = computeHref(props, tag);
      var eventType = isRouterLink(tag) ? 'nativeOn' : 'on';
      var suppliedHandler = (data[eventType] || {}).click;
      var handlers = {
        click: clickHandlerFactory({
          tag: tag,
          href: href,
          disabled: props.disabled,
          suppliedHandler: suppliedHandler,
          parent: parent
        })
      };
      var componentData = mergeData(data, {
        class: {
          active: props.active,
          disabled: props.disabled
        },
        attrs: {
          rel: rel,
          target: props.target,
          tabindex: props.disabled ? '-1' : data.attrs ? data.attrs.tabindex : null,
          'aria-disabled': props.disabled ? 'true' : null
        },
        props: _objectSpread({}, props, {
          tag: props.routerTag
        })
      }); // If href attribute exists on router-link (even undefined or null) it fails working on SSR
      // So we explicitly add it here if needed (i.e. if computeHref() is truthy)

      if (href) {
        componentData.attrs.href = href;
      } else {
        // Ensure the prop HREF does not exist for router links
        delete componentData.props.href;
      } // We want to overwrite any click handler since our callback
      // will invoke the user supplied handler if !props.disabled


      componentData[eventType] = _objectSpread({}, componentData[eventType] || {}, handlers);
      return h(tag, componentData, children);
    }
  });

  var NAME$2 = 'BBadge';
  var linkProps = propsFactory();
  delete linkProps.href.default;
  delete linkProps.to.default;
  var props$1 = _objectSpread({}, linkProps, {
    tag: {
      type: String,
      default: 'span'
    },
    variant: {
      type: String,
      default: function _default() {
        return String(getComponentConfig(NAME$2, 'variant'));
      }
    },
    pill: {
      type: Boolean,
      default: false
    } // @vue/component

  });
  var BBadge = Vue.extend({
    name: NAME$2,
    functional: true,
    props: props$1,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      var tag = !props.href && !props.to ? props.tag : BLink;
      var componentData = {
        staticClass: 'badge',
        class: ["badge-".concat(props.variant || getComponentConfig(NAME$2, 'variant')), {
          'badge-pill': Boolean(props.pill),
          active: props.active,
          disabled: props.disabled
        }],
        props: pluckProps(linkProps, props)
      };
      return h(tag, mergeData(data, componentData), children);
    }
  });

  var components$1 = {
    BBadge: BBadge
  };
  var index$1 = {
    install: installFactory({
      components: components$1
    })
  };

  var stripTagsRegex = /(<([^>]+)>)/gi; // Removes any thing that looks like an HTML tag from the supplied string

  var stripTags = function stripTags() {
    var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return String(text).replace(stripTagsRegex, '');
  }; // Generate a domProps object for either innerHTML, textContent or nothing

  var htmlOrText = function htmlOrText(innerHTML, textContent) {
    return innerHTML ? {
      innerHTML: innerHTML
    } : textContent ? {
      textContent: textContent
    } : {};
  };

  var props$2 = _objectSpread({}, propsFactory(), {
    text: {
      type: String,
      default: null
    },
    html: {
      type: String,
      default: null
    },
    ariaCurrent: {
      type: String,
      default: 'location'
    } // @vue/component

  });
  var BBreadcrumbLink = Vue.extend({
    name: 'BBreadcrumbLink',
    functional: true,
    props: props$2,
    render: function render(h, _ref) {
      var suppliedProps = _ref.props,
          data = _ref.data,
          children = _ref.children;
      var tag = suppliedProps.active ? 'span' : BLink;
      var componentData = {
        props: pluckProps(props$2, suppliedProps)
      };

      if (suppliedProps.active) {
        componentData.attrs = {
          'aria-current': suppliedProps.ariaCurrent
        };
      }

      if (!children) {
        componentData.domProps = htmlOrText(suppliedProps.html, suppliedProps.text);
      }

      return h(tag, mergeData(data, componentData), children);
    }
  });

  var BBreadcrumbItem = Vue.extend({
    name: 'BBreadcrumbItem',
    functional: true,
    props: props$2,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h('li', mergeData(data, {
        staticClass: 'breadcrumb-item',
        class: {
          active: props.active
        }
      }), [h(BBreadcrumbLink, {
        props: props
      }, children)]);
    }
  });

  var props$3 = {
    items: {
      type: Array,
      default: null
    } // @vue/component

  };
  var BBreadcrumb = Vue.extend({
    name: 'BBreadcrumb',
    functional: true,
    props: props$3,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      var childNodes = children; // Build child nodes from items if given.

      if (isArray$1(props.items)) {
        var activeDefined = false;
        childNodes = props.items.map(function (item, idx) {
          if (!isObject(item)) {
            item = {
              text: toString$1(item)
            };
          } // Copy the value here so we can normalize it.


          var active = item.active;

          if (active) {
            activeDefined = true;
          }

          if (!active && !activeDefined) {
            // Auto-detect active by position in list.
            active = idx + 1 === props.items.length;
          }

          return h(BBreadcrumbItem, {
            props: _objectSpread({}, item, {
              active: active
            })
          });
        });
      }

      return h('ol', mergeData(data, {
        staticClass: 'breadcrumb'
      }), childNodes);
    }
  });

  var components$2 = {
    BBreadcrumb: BBreadcrumb,
    BBreadcrumbItem: BBreadcrumbItem,
    BBreadcrumbLink: BBreadcrumbLink
  };
  var index$2 = {
    install: installFactory({
      components: components$2
    })
  };

  var NAME$3 = 'BButton';
  var btnProps = {
    block: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: function _default() {
        return String(getComponentConfig(NAME$3, 'variant'));
      }
    },
    type: {
      type: String,
      default: 'button'
    },
    tag: {
      type: String,
      default: 'button'
    },
    pressed: {
      // tri-state prop: true, false or null
      // => on, off, not a toggle
      type: Boolean,
      default: null
    }
  };
  var linkProps$1 = propsFactory();
  delete linkProps$1.href.default;
  delete linkProps$1.to.default;
  var linkPropKeys = keys(linkProps$1);
  var props$4 = _objectSpread({}, linkProps$1, btnProps); // --- Helper methods ---
  // Focus handler for toggle buttons.  Needs class of 'focus' when focused.

  var handleFocus = function handleFocus(evt) {
    if (evt.type === 'focusin') {
      addClass(evt.target, 'focus');
    } else if (evt.type === 'focusout') {
      removeClass(evt.target, 'focus');
    }
  }; // Is the requested button a link?


  var isLink = function isLink(props) {
    // If tag prop is set to `a`, we use a b-link to get proper disabled handling
    return Boolean(props.href || props.to || props.tag && String(props.tag).toLowerCase() === 'a');
  }; // Is the button to be a toggle button?


  var isToggle = function isToggle(props) {
    return isBoolean(props.pressed);
  }; // Is the button "really" a button?


  var isButton = function isButton(props) {
    if (isLink(props)) {
      return false;
    } else if (props.tag && String(props.tag).toLowerCase() !== 'button') {
      return false;
    }

    return true;
  }; // Is the requested tag not a button or link?


  var isNonStandardTag = function isNonStandardTag(props) {
    return !isLink(props) && !isButton(props);
  }; // Compute required classes (non static classes)


  var computeClass = function computeClass(props) {
    var _ref;

    return ["btn-".concat(props.variant || getComponentConfig(NAME$3, 'variant')), (_ref = {}, _defineProperty(_ref, "btn-".concat(props.size), Boolean(props.size)), _defineProperty(_ref, 'btn-block', props.block), _defineProperty(_ref, "disabled", props.disabled), _defineProperty(_ref, "active", props.pressed), _ref)];
  }; // Compute the link props to pass to b-link (if required)


  var computeLinkProps = function computeLinkProps(props) {
    return isLink(props) ? pluckProps(linkPropKeys, props) : null;
  }; // Compute the attributes for a button


  var computeAttrs = function computeAttrs(props, data) {
    var button = isButton(props);
    var link = isLink(props);
    var toggle = isToggle(props);
    var nonStdTag = isNonStandardTag(props);
    var role = data.attrs && data.attrs['role'] ? data.attrs['role'] : null;
    var tabindex = data.attrs ? data.attrs['tabindex'] : null;

    if (nonStdTag) {
      tabindex = '0';
    }

    return {
      // Type only used for "real" buttons
      type: button && !link ? props.type : null,
      // Disabled only set on "real" buttons
      disabled: button ? props.disabled : null,
      // We add a role of button when the tag is not a link or button for ARIA.
      // Don't bork any role provided in data.attrs when isLink or isButton
      role: nonStdTag ? 'button' : role,
      // We set the aria-disabled state for non-standard tags
      'aria-disabled': nonStdTag ? String(props.disabled) : null,
      // For toggles, we need to set the pressed state for ARIA
      'aria-pressed': toggle ? String(props.pressed) : null,
      // autocomplete off is needed in toggle mode to prevent some browsers from
      // remembering the previous setting when using the back button.
      autocomplete: toggle ? 'off' : null,
      // Tab index is used when the component is not a button.
      // Links are tabbable, but don't allow disabled, while non buttons or links
      // are not tabbable, so we mimic that functionality by disabling tabbing
      // when disabled, and adding a tabindex of '0' to non buttons or non links.
      tabindex: props.disabled && !button ? '-1' : tabindex
    };
  }; // @vue/component


  var BButton = Vue.extend({
    name: NAME$3,
    functional: true,
    props: props$4,
    render: function render(h, _ref2) {
      var props = _ref2.props,
          data = _ref2.data,
          listeners = _ref2.listeners,
          children = _ref2.children;
      var toggle = isToggle(props);
      var link = isLink(props);
      var on = {
        click: function click(e) {
          /* istanbul ignore if: blink/button disabled should handle this */
          if (props.disabled && e instanceof Event) {
            e.stopPropagation();
            e.preventDefault();
          } else if (toggle && listeners && listeners['update:pressed']) {
            // Send .sync updates to any "pressed" prop (if .sync listeners)
            // Concat will normalize the value to an array
            // without double wrapping an array value in an array.
            concat(listeners['update:pressed']).forEach(function (fn) {
              if (isFunction(fn)) {
                fn(!props.pressed);
              }
            });
          }
        }
      };

      if (toggle) {
        on.focusin = handleFocus;
        on.focusout = handleFocus;
      }

      var componentData = {
        staticClass: 'btn',
        class: computeClass(props),
        props: computeLinkProps(props),
        attrs: computeAttrs(props, data),
        on: on
      };
      return h(link ? BLink : props.tag, mergeData(data, componentData), children);
    }
  });

  var components$3 = {
    BButton: BButton,
    BBtn: BButton,
    BButtonClose: BButtonClose,
    BBtnClose: BButtonClose
  };
  var index$3 = {
    install: installFactory({
      components: components$3
    })
  };

  var props$5 = {
    vertical: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: null
    },
    tag: {
      type: String,
      default: 'div'
    },
    ariaRole: {
      type: String,
      default: 'group'
    } // @vue/component

  };
  var BButtonGroup = Vue.extend({
    name: 'BButtonGroup',
    functional: true,
    props: props$5,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.tag, mergeData(data, {
        class: _defineProperty({
          'btn-group': !props.vertical,
          'btn-group-vertical': props.vertical
        }, "btn-group-".concat(props.size), Boolean(props.size)),
        attrs: {
          role: props.ariaRole
        }
      }), children);
    }
  });

  var components$4 = {
    BButtonGroup: BButtonGroup,
    BBtnGroup: BButtonGroup
  };
  var index$4 = {
    install: installFactory({
      components: components$4
    })
  };

  /*
   * Key Codes (events)
   */
  var KEY_CODES = {
    SPACE: 32,
    ENTER: 13,
    ESC: 27,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    PAGEUP: 33,
    PAGEDOWN: 34,
    HOME: 36,
    END: 35,
    TAB: 9,
    SHIFT: 16,
    CTRL: 17,
    BACKSPACE: 8,
    ALT: 18,
    PAUSE: 19,
    BREAK: 19,
    INSERT: 45,
    INS: 45,
    DELETE: 46
  };

  var ITEM_SELECTOR = ['.btn:not(.disabled):not([disabled]):not(.dropdown-item)', '.form-control:not(.disabled):not([disabled])', 'select:not(.disabled):not([disabled])', 'input[type="checkbox"]:not(.disabled)', 'input[type="radio"]:not(.disabled)'].join(','); // @vue/component

  var BButtonToolbar = Vue.extend({
    name: 'BButtonToolbar',
    props: {
      justify: {
        type: Boolean,
        default: false
      },
      keyNav: {
        type: Boolean,
        default: false
      }
    },
    mounted: function mounted() {
      if (this.keyNav) {
        // Pre-set the tabindexes if the markup does not include tabindex="-1" on the toolbar items
        this.getItems();
      }
    },
    methods: {
      onFocusin: function onFocusin(evt) {
        if (evt.target === this.$el) {
          evt.preventDefault();
          evt.stopPropagation();
          this.focusFirst(evt);
        }
      },
      stop: function stop(evt) {
        evt.preventDefault();
        evt.stopPropagation();
      },
      onKeydown: function onKeydown(evt) {
        if (!this.keyNav) {
          /* istanbul ignore next: should never happen */
          return;
        }

        var key = evt.keyCode;
        var shift = evt.shiftKey;

        if (key === KEY_CODES.UP || key === KEY_CODES.LEFT) {
          this.stop(evt);
          shift ? this.focusFirst(evt) : this.focusPrev(evt);
        } else if (key === KEY_CODES.DOWN || key === KEY_CODES.RIGHT) {
          this.stop(evt);
          shift ? this.focusLast(evt) : this.focusNext(evt);
        }
      },
      setItemFocus: function setItemFocus(item) {
        item && item.focus && item.focus();
      },
      focusFirst: function focusFirst(evt) {
        var items = this.getItems();
        this.setItemFocus(items[0]);
      },
      focusPrev: function focusPrev(evt) {
        var items = this.getItems();
        var index = items.indexOf(evt.target);

        if (index > -1) {
          items = items.slice(0, index).reverse();
          this.setItemFocus(items[0]);
        }
      },
      focusNext: function focusNext(evt) {
        var items = this.getItems();
        var index = items.indexOf(evt.target);

        if (index > -1) {
          items = items.slice(index + 1);
          this.setItemFocus(items[0]);
        }
      },
      focusLast: function focusLast(evt) {
        var items = this.getItems().reverse();
        this.setItemFocus(items[0]);
      },
      getItems: function getItems() {
        var items = selectAll(ITEM_SELECTOR, this.$el);
        items.forEach(function (item) {
          // Ensure tabfocus is -1 on any new elements
          item.tabIndex = -1;
        });
        return items.filter(function (el) {
          return isVisible(el);
        });
      }
    },
    render: function render(h) {
      return h('div', {
        staticClass: 'btn-toolbar',
        class: {
          'justify-content-between': this.justify
        },
        attrs: {
          role: 'toolbar',
          tabindex: this.keyNav ? '0' : null
        },
        on: this.keyNav ? {
          focusin: this.onFocusin,
          keydown: this.onKeydown
        } : {}
      }, [this.$slots.default]);
    }
  });

  var components$5 = {
    BButtonToolbar: BButtonToolbar,
    BBtnToolbar: BButtonToolbar
  };
  var index$5 = {
    install: installFactory({
      components: components$5
    })
  };

  var props$6 = {
    tag: {
      type: String,
      default: 'div'
    } // @vue/component

  };
  var BInputGroupText = Vue.extend({
    name: 'BInputGroupText',
    functional: true,
    props: props$6,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.tag, mergeData(data, {
        staticClass: 'input-group-text'
      }), children);
    }
  });

  var commonProps = {
    id: {
      type: String,
      default: null
    },
    tag: {
      type: String,
      default: 'div'
    },
    isText: {
      type: Boolean,
      default: false
    } // @vue/component

  };
  var BInputGroupAddon = Vue.extend({
    name: 'BInputGroupAddon',
    functional: true,
    props: _objectSpread({}, commonProps, {
      append: {
        type: Boolean,
        default: false
      }
    }),
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.tag, mergeData(data, {
        class: {
          'input-group-append': props.append,
          'input-group-prepend': !props.append
        },
        attrs: {
          id: props.id
        }
      }), props.isText ? [h(BInputGroupText, children)] : children);
    }
  });

  var BInputGroupPrepend = Vue.extend({
    name: 'BInputGroupPrepend',
    functional: true,
    props: commonProps,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      // pass all our props/attrs down to child, and set`append` to false
      return h(BInputGroupAddon, mergeData(data, {
        props: _objectSpread({}, props, {
          append: false
        })
      }), children);
    }
  });

  var BInputGroupAppend = Vue.extend({
    name: 'BInputGroupAppend',
    functional: true,
    props: commonProps,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      // pass all our props/attrs down to child, and set`append` to true
      return h(BInputGroupAddon, mergeData(data, {
        props: _objectSpread({}, props, {
          append: true
        })
      }), children);
    }
  });

  var props$7 = {
    id: {
      type: String
    },
    size: {
      type: String
    },
    prepend: {
      type: String
    },
    prependHTML: {
      type: String
    },
    append: {
      type: String
    },
    appendHTML: {
      type: String
    },
    tag: {
      type: String,
      default: 'div'
    } // @vue/component

  };
  var BInputGroup = Vue.extend({
    name: 'BInputGroup',
    functional: true,
    props: props$7,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          slots = _ref.slots;
      var $slots = slots();
      var childNodes = []; // Prepend prop

      if (props.prepend) {
        childNodes.push(h(BInputGroupPrepend, [h(BInputGroupText, {
          domProps: htmlOrText(props.prependHTML, props.prepend)
        })]));
      } else {
        childNodes.push(h(false));
      } // Prepend slot


      if ($slots.prepend) {
        childNodes.push(h(BInputGroupPrepend, $slots.prepend));
      } else {
        childNodes.push(h(false));
      } // Default slot


      if ($slots.default) {
        childNodes.push.apply(childNodes, _toConsumableArray($slots.default));
      } else {
        childNodes.push(h(false));
      } // Append prop


      if (props.append) {
        childNodes.push(h(BInputGroupAppend, [h(BInputGroupText, {
          domProps: htmlOrText(props.appendHTML, props.append)
        })]));
      } else {
        childNodes.push(h(false));
      } // Append slot


      if ($slots.append) {
        childNodes.push(h(BInputGroupAppend, $slots.append));
      } else {
        childNodes.push(h(false));
      }

      return h(props.tag, mergeData(data, {
        staticClass: 'input-group',
        class: _defineProperty({}, "input-group-".concat(props.size), Boolean(props.size)),
        attrs: {
          id: props.id || null,
          role: 'group'
        }
      }), childNodes);
    }
  });

  var components$6 = {
    BInputGroup: BInputGroup,
    BInputGroupAddon: BInputGroupAddon,
    BInputGroupPrepend: BInputGroupPrepend,
    BInputGroupAppend: BInputGroupAppend,
    BInputGroupText: BInputGroupText
  };
  var index$6 = {
    install: installFactory({
      components: components$6
    })
  };

  /**
   * Transform the first character to uppercase
   * @param {string} str
   */

  var upperFirst = function upperFirst(str) {
    if (!isString(str)) {
      str = String(str);
    }

    str = str.trim();
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  /**
   * @param {string} prefix
   * @param {string} value
   */

  var prefixPropName = function prefixPropName(prefix, value) {
    return prefix + upperFirst(value);
  };

  /**
   * @param {string} str
   */
  var lowerFirst = function lowerFirst(str) {
    str = String(str);
    return str.charAt(0).toLowerCase() + str.slice(1);
  };

  /**
   * @param {string} prefix
   * @param {string} value
   */

  var unprefixPropName = function unprefixPropName(prefix, value) {
    return lowerFirst(value.replace(prefix, ''));
  };

  /**
   * Copies props from one array/object to a new array/object. Prop values
   * are also cloned as new references to prevent possible mutation of original
   * prop object values. Optionally accepts a function to transform the prop name.
   *
   * @param {[]|{}} props
   * @param {Function} transformFn
   */

  var copyProps = function copyProps(props) {
    var transformFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : identity;

    if (isArray$1(props)) {
      return props.map(transformFn);
    } // Props as an object.


    var copied = {};

    for (var prop in props) {
      /* istanbul ignore else */
      if (props.hasOwnProperty(prop)) {
        // If the prop value is an object, do a shallow clone to prevent
        // potential mutations to the original object.
        copied[transformFn(prop)] = isObject(props[prop]) ? _objectSpread({}, props[prop]) : props[prop];
      }
    }

    return copied;
  };

  // @vue/component
  var cardMixin = {
    props: {
      tag: {
        type: String,
        default: 'div'
      },
      bgVariant: {
        type: String,
        default: null
      },
      borderVariant: {
        type: String,
        default: null
      },
      textVariant: {
        type: String,
        default: null
      }
    }
  };

  var props$8 = {
    title: {
      type: String,
      default: ''
    },
    titleTag: {
      type: String,
      default: 'h4'
    } // @vue/component

  };
  var BCardTitle = Vue.extend({
    name: 'BCardTitle',
    functional: true,
    props: props$8,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.titleTag, mergeData(data, {
        staticClass: 'card-title'
      }), children || props.title);
    }
  });

  var NAME$4 = 'BCardSubTitle';
  var props$9 = {
    subTitle: {
      type: String,
      default: ''
    },
    subTitleTag: {
      type: String,
      default: 'h6'
    },
    subTitleTextVariant: {
      type: String,
      default: function _default() {
        return String(getComponentConfig(NAME$4, 'subTitleTextVariant') || '') || null;
      }
    } // @vue/component

  };
  var BCardSubTitle = Vue.extend({
    name: NAME$4,
    functional: true,
    props: props$9,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.subTitleTag, mergeData(data, {
        staticClass: 'card-subtitle',
        class: [props.subTitleTextVariant ? "text-".concat(props.subTitleTextVariant) : null]
      }), children || props.subTitle);
    }
  });

  var props$a = _objectSpread({}, copyProps(cardMixin.props, prefixPropName.bind(null, 'body')), {
    bodyClass: {
      type: [String, Object, Array],
      default: null
    }
  }, props$8, props$9, {
    overlay: {
      type: Boolean,
      default: false
    } // @vue/component

  });
  var BCardBody = Vue.extend({
    name: 'BCardBody',
    functional: true,
    props: props$a,
    render: function render(h, _ref) {
      var _ref2;

      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      var cardTitle = h(false);
      var cardSubTitle = h(false);
      var cardContent = children || [h(false)];

      if (props.title) {
        cardTitle = h(BCardTitle, {
          props: pluckProps(props$8, props)
        });
      }

      if (props.subTitle) {
        cardSubTitle = h(BCardSubTitle, {
          props: pluckProps(props$9, props),
          class: ['mb-2']
        });
      }

      return h(props.bodyTag, mergeData(data, {
        staticClass: 'card-body',
        class: [(_ref2 = {
          'card-img-overlay': props.overlay
        }, _defineProperty(_ref2, "bg-".concat(props.bodyBgVariant), Boolean(props.bodyBgVariant)), _defineProperty(_ref2, "border-".concat(props.bodyBorderVariant), Boolean(props.bodyBorderVariant)), _defineProperty(_ref2, "text-".concat(props.bodyTextVariant), Boolean(props.bodyTextVariant)), _ref2), props.bodyClass || {}]
      }), [cardTitle, cardSubTitle].concat(_toConsumableArray(cardContent)));
    }
  });

  var props$b = _objectSpread({}, copyProps(cardMixin.props, prefixPropName.bind(null, 'header')), {
    header: {
      type: String,
      default: null
    },
    headerHtml: {
      type: String,
      default: null
    },
    headerClass: {
      type: [String, Object, Array],
      default: null
    } // @vue/component

  });
  var BCardHeader = Vue.extend({
    name: 'BCardHeader',
    functional: true,
    props: props$b,
    render: function render(h, _ref) {
      var _ref2;

      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.headerTag, mergeData(data, {
        staticClass: 'card-header',
        class: [props.headerClass, (_ref2 = {}, _defineProperty(_ref2, "bg-".concat(props.headerBgVariant), Boolean(props.headerBgVariant)), _defineProperty(_ref2, "border-".concat(props.headerBorderVariant), Boolean(props.headerBorderVariant)), _defineProperty(_ref2, "text-".concat(props.headerTextVariant), Boolean(props.headerTextVariant)), _ref2)]
      }), children || [h('div', {
        domProps: htmlOrText(props.headerHtml, props.header)
      })]);
    }
  });

  var props$c = _objectSpread({}, copyProps(cardMixin.props, prefixPropName.bind(null, 'footer')), {
    footer: {
      type: String,
      default: null
    },
    footerHtml: {
      type: String,
      default: null
    },
    footerClass: {
      type: [String, Object, Array],
      default: null
    } // @vue/component

  });
  var BCardFooter = Vue.extend({
    name: 'BCardFooter',
    functional: true,
    props: props$c,
    render: function render(h, _ref) {
      var _ref2;

      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.footerTag, mergeData(data, {
        staticClass: 'card-footer',
        class: [props.footerClass, (_ref2 = {}, _defineProperty(_ref2, "bg-".concat(props.footerBgVariant), Boolean(props.footerBgVariant)), _defineProperty(_ref2, "border-".concat(props.footerBorderVariant), Boolean(props.footerBorderVariant)), _defineProperty(_ref2, "text-".concat(props.footerTextVariant), Boolean(props.footerTextVariant)), _ref2)]
      }), children || [h('div', {
        domProps: htmlOrText(props.footerHtml, props.footer)
      })]);
    }
  });

  var props$d = {
    src: {
      type: String,
      default: null,
      required: true
    },
    alt: {
      type: String,
      default: null
    },
    top: {
      type: Boolean,
      default: false
    },
    bottom: {
      type: Boolean,
      default: false
    },
    left: {
      type: Boolean,
      default: false
    },
    start: {
      type: Boolean,
      default: false // alias of 'left'

    },
    right: {
      type: Boolean,
      default: false
    },
    end: {
      type: Boolean,
      default: false // alias of 'right'

    },
    height: {
      type: String,
      default: null
    },
    width: {
      type: String,
      default: null
    } // @vue/component

  };
  var BCardImg = Vue.extend({
    name: 'BCardImg',
    functional: true,
    props: props$d,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data;
      var baseClass = 'card-img';

      if (props.top) {
        baseClass += '-top';
      } else if (props.right || props.end) {
        baseClass += '-right';
      } else if (props.bottom) {
        baseClass += '-bottom';
      } else if (props.left || props.start) {
        baseClass += '-left';
      }

      return h('img', mergeData(data, {
        class: [baseClass],
        attrs: {
          src: props.src,
          alt: props.alt,
          height: props.height,
          width: props.width
        }
      }));
    }
  });

  var cardImgProps = copyProps(props$d, prefixPropName.bind(null, 'img'));
  cardImgProps.imgSrc.required = false;
  var props$e = _objectSpread({}, props$a, props$b, props$c, cardImgProps, copyProps(cardMixin.props), {
    align: {
      type: String,
      default: null
    },
    noBody: {
      type: Boolean,
      default: false
    } // @vue/component

  });
  var BCard = Vue.extend({
    name: 'BCard',
    functional: true,
    props: props$e,
    render: function render(h, _ref) {
      var _class;

      var props = _ref.props,
          data = _ref.data,
          slots = _ref.slots;
      var $slots = slots(); // Create placeholder elements for each section

      var imgFirst = h(false);
      var header = h(false);
      var content = h(false);
      var footer = h(false);
      var imgLast = h(false);

      if (props.imgSrc) {
        var img = h(BCardImg, {
          props: pluckProps(cardImgProps, props, unprefixPropName.bind(null, 'img'))
        });

        if (props.imgBottom) {
          imgLast = img;
        } else {
          imgFirst = img;
        }
      }

      if (props.header || $slots.header) {
        header = h(BCardHeader, {
          props: pluckProps(props$b, props)
        }, $slots.header);
      }

      if (props.noBody) {
        content = $slots.default || [];
      } else {
        // Wrap content in card-body
        content = [h(BCardBody, {
          props: pluckProps(props$a, props)
        }, $slots.default)];
      }

      if (props.footer || $slots.footer) {
        footer = h(BCardFooter, {
          props: pluckProps(props$c, props)
        }, $slots.footer);
      }

      return h(props.tag, mergeData(data, {
        staticClass: 'card',
        class: (_class = {
          'flex-row': props.imgLeft || props.imgStart,
          'flex-row-reverse': (props.imgRight || props.imgEnd) && !(props.imgLeft || props.imgStart)
        }, _defineProperty(_class, "text-".concat(props.align), Boolean(props.align)), _defineProperty(_class, "bg-".concat(props.bgVariant), Boolean(props.bgVariant)), _defineProperty(_class, "border-".concat(props.borderVariant), Boolean(props.borderVariant)), _defineProperty(_class, "text-".concat(props.textVariant), Boolean(props.textVariant)), _class)
      }), [imgFirst, header].concat(_toConsumableArray(content), [footer, imgLast]));
    }
  });

  var NAME$5 = 'BImg'; // Blank image with fill template

  var BLANK_TEMPLATE = '<svg width="%{w}" height="%{h}" ' + 'xmlns="http://www.w3.org/2000/svg" ' + 'viewBox="0 0 %{w} %{h}" preserveAspectRatio="none">' + '<rect width="100%" height="100%" style="fill:%{f};"></rect>' + '</svg>';
  var props$f = {
    src: {
      type: String,
      default: null
    },
    alt: {
      type: String,
      default: null
    },
    width: {
      type: [Number, String],
      default: null
    },
    height: {
      type: [Number, String],
      default: null
    },
    block: {
      type: Boolean,
      default: false
    },
    fluid: {
      type: Boolean,
      default: false
    },
    fluidGrow: {
      // Gives fluid images class `w-100` to make them grow to fit container
      type: Boolean,
      default: false
    },
    rounded: {
      // rounded can be:
      //   false: no rounding of corners
      //   true: slightly rounded corners
      //   'top': top corners rounded
      //   'right': right corners rounded
      //   'bottom': bottom corners rounded
      //   'left': left corners rounded
      //   'circle': circle/oval
      //   '0': force rounding off
      type: [Boolean, String],
      default: false
    },
    thumbnail: {
      type: Boolean,
      default: false
    },
    left: {
      type: Boolean,
      default: false
    },
    right: {
      type: Boolean,
      default: false
    },
    center: {
      type: Boolean,
      default: false
    },
    blank: {
      type: Boolean,
      default: false
    },
    blankColor: {
      type: String,
      default: function _default() {
        return String(getComponentConfig(NAME$5, 'blankColor'));
      }
    } // --- Helper methods ---

  };

  function makeBlankImgSrc(width, height, color) {
    var src = encodeURIComponent(BLANK_TEMPLATE.replace('%{w}', String(width)).replace('%{h}', String(height)).replace('%{f}', color));
    return "data:image/svg+xml;charset=UTF-8,".concat(src);
  } // @vue/component


  var BImg = Vue.extend({
    name: 'BImg',
    functional: true,
    props: props$f,
    render: function render(h, _ref) {
      var _class;

      var props = _ref.props,
          data = _ref.data;
      var src = props.src;
      var width = parseInt(props.width, 10) ? parseInt(props.width, 10) : null;
      var height = parseInt(props.height, 10) ? parseInt(props.height, 10) : null;
      var align = null;
      var block = props.block;

      if (props.blank) {
        if (!height && Boolean(width)) {
          height = width;
        } else if (!width && Boolean(height)) {
          width = height;
        }

        if (!width && !height) {
          width = 1;
          height = 1;
        } // Make a blank SVG image


        src = makeBlankImgSrc(width, height, props.blankColor || 'transparent');
      }

      if (props.left) {
        align = 'float-left';
      } else if (props.right) {
        align = 'float-right';
      } else if (props.center) {
        align = 'mx-auto';
        block = true;
      }

      return h('img', mergeData(data, {
        attrs: {
          src: src,
          alt: props.alt,
          width: width ? String(width) : null,
          height: height ? String(height) : null
        },
        class: (_class = {
          'img-thumbnail': props.thumbnail,
          'img-fluid': props.fluid || props.fluidGrow,
          'w-100': props.fluidGrow,
          rounded: props.rounded === '' || props.rounded === true
        }, _defineProperty(_class, "rounded-".concat(props.rounded), isString(props.rounded) && props.rounded !== ''), _defineProperty(_class, align, Boolean(align)), _defineProperty(_class, 'd-block', block), _class)
      }));
    }
  });

  var NAME$6 = 'BImgLazy';
  var THROTTLE = 100;
  var EventOptions = {
    passive: true,
    capture: false
  };
  var props$g = {
    src: {
      type: String,
      default: null,
      required: true
    },
    alt: {
      type: String,
      default: null
    },
    width: {
      type: [Number, String],
      default: null
    },
    height: {
      type: [Number, String],
      default: null
    },
    blankSrc: {
      // If null, a blank image is generated
      type: String,
      default: null
    },
    blankColor: {
      type: String,
      default: function _default() {
        return String(getComponentConfig(NAME$6, 'blankColor'));
      }
    },
    blankWidth: {
      type: [Number, String],
      default: null
    },
    blankHeight: {
      type: [Number, String],
      default: null
    },
    show: {
      type: Boolean,
      default: false
    },
    fluid: {
      type: Boolean,
      default: false
    },
    fluidGrow: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    },
    thumbnail: {
      type: Boolean,
      default: false
    },
    rounded: {
      type: [Boolean, String],
      default: false
    },
    left: {
      type: Boolean,
      default: false
    },
    right: {
      type: Boolean,
      default: false
    },
    center: {
      type: Boolean,
      default: false
    },
    offset: {
      type: [Number, String],
      default: 360
    },
    throttle: {
      type: [Number, String],
      default: THROTTLE
    } // @vue/component

  };
  var BImgLazy = Vue.extend({
    name: NAME$6,
    props: props$g,
    data: function data() {
      return {
        isShown: false,
        scrollTimeout: null
      };
    },
    computed: {
      computedSrc: function computedSrc() {
        return !this.blankSrc || this.isShown ? this.src : this.blankSrc;
      },
      computedBlank: function computedBlank() {
        return !(this.isShown || this.blankSrc);
      },
      computedWidth: function computedWidth() {
        return this.isShown ? this.width : this.blankWidth || this.width;
      },
      computedHeight: function computedHeight() {
        return this.isShown ? this.height : this.blankHeight || this.height;
      }
    },
    watch: {
      show: function show(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.isShown = newVal;

          if (!newVal) {
            // Make sure listeners are re-enabled if img is force set to blank
            this.setListeners(true);
          }
        }
      },
      isShown: function isShown(newVal, oldVal) {
        if (newVal !== oldVal) {
          // Update synched show prop
          this.$emit('update:show', newVal);
        }
      }
    },
    created: function created() {
      this.isShown = this.show;
    },
    mounted: function mounted() {
      if (this.isShown) {
        this.setListeners(false);
      } else {
        this.setListeners(true);
        this.$nextTick(this.checkView);
      }
    },
    activated: function activated()
    /* istanbul ignore next */
    {
      if (!this.isShown) {
        this.setListeners(true);
        this.$nextTick(this.checkView);
      }
    },
    deactivated: function deactivated()
    /* istanbul ignore next */
    {
      this.setListeners(false);
    },
    beforeDestroy: function beforeDestroy() {
      this.setListeners(false);
    },
    methods: {
      setListeners: function setListeners(on) {
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
          this.scrollTimeout = null;
        }

        var root = window;

        if (on) {
          eventOn(this.$el, 'load', this.checkView);
          eventOn(root, 'scroll', this.onScroll, EventOptions);
          eventOn(root, 'resize', this.onScroll, EventOptions);
          eventOn(root, 'orientationchange', this.onScroll, EventOptions);
          eventOn(document, 'transitionend', this.onScroll, EventOptions);
        } else {
          eventOff(this.$el, 'load', this.checkView);
          eventOff(root, 'scroll', this.onScroll, EventOptions);
          eventOff(root, 'resize', this.onScroll, EventOptions);
          eventOff(root, 'orientationchange', this.onScroll, EventOptions);
          eventOff(document, 'transitionend', this.onScroll, EventOptions);
        }
      },
      checkView: function checkView() {
        // check bounding box + offset to see if we should show
        if (this.isShown) {
          this.setListeners(false);
          return;
        }

        var offset = parseInt(this.offset, 10) || 0;
        var docElement = document.documentElement;
        var view = {
          l: 0 - offset,
          t: 0 - offset,
          b: docElement.clientHeight + offset,
          r: docElement.clientWidth + offset
          /* istanbul ignore next */

        };
        var box = getBCR(this.$el);
        /* istanbul ignore next: can't test getBoundingClientRect in JSDOM */

        if (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b) {
          // image is in view (or about to be in view)
          this.isShown = true;
          this.setListeners(false);
        }
      },
      onScroll: function onScroll() {
        if (this.isShown) {
          this.setListeners(false);
        } else {
          clearTimeout(this.scrollTimeout);
          this.scrollTimeout = setTimeout(this.checkView, parseInt(this.throttle, 10) || THROTTLE);
        }
      }
    },
    render: function render(h) {
      return h(BImg, {
        props: {
          src: this.computedSrc,
          alt: this.alt,
          blank: this.computedBlank,
          blankColor: this.blankColor,
          width: this.computedWidth,
          height: this.computedHeight,
          fluid: this.fluid,
          fluidGrow: this.fluidGrow,
          block: this.block,
          thumbnail: this.thumbnail,
          rounded: this.rounded,
          left: this.left,
          right: this.right,
          center: this.center
        }
      });
    }
  });

  // The `omit()` util creates a new object, so we can just pass the original props

  var lazyProps = omit(props$g, ['left', 'right', 'center', 'block', 'rounded', 'thumbnail', 'fluid', 'fluidGrow']);
  var props$h = _objectSpread({}, lazyProps, {
    top: {
      type: Boolean,
      default: false
    },
    bottom: {
      type: Boolean,
      default: false
    },
    left: {
      type: Boolean,
      default: false
    },
    start: {
      type: Boolean,
      default: false // alias of 'left'

    },
    right: {
      type: Boolean,
      default: false
    },
    end: {
      type: Boolean,
      default: false // alias of 'right'

    } // @vue/component

  });
  var BCardImgLazy = Vue.extend({
    name: 'BCardImgLazy',
    functional: true,
    props: props$h,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data;
      var baseClass = 'card-img';

      if (props.top) {
        baseClass += '-top';
      } else if (props.right || props.end) {
        baseClass += '-right';
      } else if (props.bottom) {
        baseClass += '-bottom';
      } else if (props.left || props.start) {
        baseClass += '-left';
      } // False out the left/center/right props before passing to b-img-lazy


      var lazyProps = _objectSpread({}, props, {
        left: false,
        right: false,
        center: false
      });

      return h(BImgLazy, mergeData(data, {
        class: [baseClass],
        props: lazyProps
      }));
    }
  });

  var props$i = {
    textTag: {
      type: String,
      default: 'p'
    } // @vue/component

  };
  var BCardText = Vue.extend({
    name: 'BCardText',
    functional: true,
    props: props$i,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.textTag, mergeData(data, {
        staticClass: 'card-text'
      }), children);
    }
  });

  var props$j = {
    tag: {
      type: String,
      default: 'div'
    },
    deck: {
      type: Boolean,
      default: false
    },
    columns: {
      type: Boolean,
      default: false
    } // @vue/component

  };
  var BCardGroup = Vue.extend({
    name: 'BCardGroup',
    functional: true,
    props: props$j,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      var baseClass = 'card-group';

      if (props.deck) {
        baseClass = 'card-deck';
      } else if (props.columns) {
        baseClass = 'card-columns';
      }

      return h(props.tag, mergeData(data, {
        class: baseClass
      }), children);
    }
  });

  var components$7 = {
    BCard: BCard,
    BCardHeader: BCardHeader,
    BCardBody: BCardBody,
    BCardTitle: BCardTitle,
    BCardSubTitle: BCardSubTitle,
    BCardFooter: BCardFooter,
    BCardImg: BCardImg,
    BCardImgLazy: BCardImgLazy,
    BCardText: BCardText,
    BCardGroup: BCardGroup
  };
  var index$7 = {
    install: installFactory({
      components: components$7
    })
  };

  var noop = function noop() {};

  /**
   * Observe a DOM element changes, falls back to eventListener mode
   * @param {Element} el The DOM element to observe
   * @param {Function} callback callback to be called on change
   * @param {object} [opts={childList: true, subtree: true}] observe options
   * @see http://stackoverflow.com/questions/3219758
   */

  var observeDom = function observeDom(el, callback, opts)
  /* istanbul ignore next: difficult to test in JSDOM */
  {
    // Handle cases where we might be passed a Vue instance
    el = el ? el.$el || el : null; // Early exit when we have no element

    /* istanbul ignore next: difficult to test in JSDOM */

    if (!isElement(el)) {
      return null;
    } // Exit and throw a warning when `MutationObserver` isn't available


    if (warnNoMutationObserverSupport('observeDom')) {
      return null;
    } // Define a new observer


    var obs = new MutationObs(function (mutations) {
      var changed = false; // A mutation can contain several change records, so we loop
      // through them to see what has changed
      // We break out of the loop early if any "significant" change
      // has been detected

      for (var i = 0; i < mutations.length && !changed; i++) {
        // The mutation record
        var mutation = mutations[i]; // Mutation type

        var type = mutation.type; // DOM node (could be any DOM node type - HTMLElement, Text, comment, etc.)

        var target = mutation.target; // Detect whether a change happened based on type and target

        if (type === 'characterData' && target.nodeType === Node.TEXT_NODE) {
          // We ignore nodes that are not TEXT (i.e. comments, etc)
          // as they don't change layout
          changed = true;
        } else if (type === 'attributes') {
          changed = true;
        } else if (type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
          // This includes HTMLElement and text nodes being
          // added/removed/re-arranged
          changed = true;
        }
      } // We only call the callback if a change that could affect
      // layout/size truely happened


      if (changed) {
        callback();
      }
    }); // Have the observer observe foo for changes in children, etc

    obs.observe(el, _objectSpread({
      childList: true,
      subtree: true
    }, opts)); // We return a reference to the observer so that `obs.disconnect()`
    // can be called if necessary
    // To reduce overhead when the root element is hidden

    return obs;
  };

  /*
   * SSR Safe Client Side ID attribute generation
   * id's can only be generated client side, after mount.
   * this._uid is not synched between server and client.
   */
  // @vue/component
  var idMixin = {
    props: {
      id: {
        type: String,
        default: null
      }
    },
    data: function data() {
      return {
        localId_: null
      };
    },
    computed: {
      safeId: function safeId() {
        // Computed property that returns a dynamic function for creating the ID.
        // Reacts to changes in both .id and .localId_ And regens a new function
        var id = this.id || this.localId_; // We return a function that accepts an optional suffix string
        // So this computed prop looks and works like a method!!!
        // But benefits from Vue's Computed prop caching

        var fn = function fn(suffix) {
          if (!id) {
            return null;
          }

          suffix = String(suffix || '').replace(/\s+/g, '_');
          return suffix ? id + '_' + suffix : id;
        };

        return fn;
      }
    },
    mounted: function mounted() {
      var _this = this;

      // mounted only occurs client side
      this.$nextTick(function () {
        // Update dom with auto ID after dom loaded to prevent
        // SSR hydration errors.
        _this.localId_ = "__BVID__".concat(_this._uid);
      });
    }
  };

  var NAME$7 = 'BCarousel'; // Slide directional classes

  var DIRECTION = {
    next: {
      dirClass: 'carousel-item-left',
      overlayClass: 'carousel-item-next'
    },
    prev: {
      dirClass: 'carousel-item-right',
      overlayClass: 'carousel-item-prev'
    } // Fallback Transition duration (with a little buffer) in ms

  };
  var TRANS_DURATION = 600 + 50; // Time for mouse compat events to fire after touch

  var TOUCH_EVENT_COMPAT_WAIT = 500; // Number of pixels to consider touch move a swipe

  var SWIPE_THRESHOLD = 40; // PointerEvent pointer types

  var PointerType = {
    TOUCH: 'touch',
    PEN: 'pen' // Transition Event names

  };
  var TransitionEndEvents = {
    WebkitTransition: 'webkitTransitionEnd',
    MozTransition: 'transitionend',
    OTransition: 'otransitionend oTransitionEnd',
    transition: 'transitionend'
  };
  var EventOptions$1 = {
    passive: true,
    capture: false // Return the browser specific transitionEnd event name

  };

  function getTransitionEndEvent(el) {
    for (var name in TransitionEndEvents) {
      if (!isUndefined(el.style[name])) {
        return TransitionEndEvents[name];
      }
    } // fallback

    /* istanbul ignore next */


    return null;
  } // @vue/component


  var BCarousel = Vue.extend({
    name: 'BCarousel',
    mixins: [idMixin],
    provide: function provide() {
      return {
        bvCarousel: this
      };
    },
    model: {
      prop: 'value',
      event: 'input'
    },
    props: {
      labelPrev: {
        type: String,
        default: function _default() {
          return String(getComponentConfig(NAME$7, 'labelPrev'));
        }
      },
      labelNext: {
        type: String,
        default: function _default() {
          return String(getComponentConfig(NAME$7, 'labelNext'));
        }
      },
      labelGotoSlide: {
        type: String,
        default: function _default() {
          return String(getComponentConfig(NAME$7, 'labelGotoSlide'));
        }
      },
      labelIndicators: {
        type: String,
        default: function _default() {
          return String(getComponentConfig(NAME$7, 'labelIndicators'));
        }
      },
      interval: {
        type: Number,
        default: 5000
      },
      indicators: {
        type: Boolean,
        default: false
      },
      controls: {
        type: Boolean,
        default: false
      },
      noAnimation: {
        // Disable slide/fade animation
        type: Boolean,
        default: false
      },
      fade: {
        // Enable cross-fade animation instead of slide animation
        type: Boolean,
        default: false
      },
      noTouch: {
        // Sniffed by carousel-slide
        type: Boolean,
        default: false
      },
      noHoverPause: {
        // Disable pause on hover
        type: Boolean,
        default: false
      },
      imgWidth: {
        // Sniffed by carousel-slide
        type: [Number, String] // default: undefined

      },
      imgHeight: {
        // Sniffed by carousel-slide
        type: [Number, String] // default: undefined

      },
      background: {
        type: String // default: undefined

      },
      value: {
        type: Number,
        default: 0
      }
    },
    data: function data() {
      return {
        index: this.value || 0,
        isSliding: false,
        transitionEndEvent: null,
        slides: [],
        direction: null,
        isPaused: !(parseInt(this.interval, 10) > 0),
        // Touch event handling values
        touchStartX: 0,
        touchDeltaX: 0
      };
    },
    watch: {
      value: function value(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.setSlide(newVal);
        }
      },
      interval: function interval(newVal, oldVal) {
        if (newVal === oldVal) {
          /* istanbul ignore next */
          return;
        }

        if (!newVal) {
          // Pausing slide show
          this.pause(false);
        } else {
          // Restarting or Changing interval
          this.pause(true);
          this.start(false);
        }
      },
      isPaused: function isPaused(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.$emit(newVal ? 'paused' : 'unpaused');
        }
      },
      index: function index(to, from) {
        if (to === from || this.isSliding) {
          /* istanbul ignore next */
          return;
        }

        this.doSlide(to, from);
      }
    },
    created: function created() {
      // Create private non-reactive props
      this._intervalId = null;
      this._animationTimeout = null;
      this._touchTimeout = null; // Set initial paused state

      this.isPaused = !(parseInt(this.interval, 10) > 0);
    },
    mounted: function mounted() {
      // Cache current browser transitionend event name
      this.transitionEndEvent = getTransitionEndEvent(this.$el) || null; // Get all slides

      this.updateSlides(); // Observe child changes so we can update slide list

      observeDom(this.$refs.inner, this.updateSlides.bind(this), {
        subtree: false,
        childList: true,
        attributes: true,
        attributeFilter: ['id']
      });
    },
    beforeDestroy: function beforeDestroy() {
      clearTimeout(this._animationTimeout);
      clearTimeout(this._touchTimeout);
      clearInterval(this._intervalId);
      this._intervalId = null;
      this._animationTimeout = null;
      this._touchTimeout = null;
    },
    methods: {
      // Set slide
      setSlide: function setSlide(slide) {
        var _this = this;

        var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        // Don't animate when page is not visible

        /* istanbul ignore if: difficult to test */
        if (isBrowser && document.visibilityState && document.hidden) {
          return;
        }

        var len = this.slides.length; // Don't do anything if nothing to slide to

        if (len === 0) {
          return;
        } // Don't change slide while transitioning, wait until transition is done


        if (this.isSliding) {
          // Schedule slide after sliding complete
          this.$once('sliding-end', function () {
            return _this.setSlide(slide, direction);
          });
          return;
        }

        this.direction = direction; // Make sure we have an integer (you never know!)

        slide = Math.floor(slide); // Set new slide index. Wrap around if necessary

        this.index = slide >= len ? 0 : slide >= 0 ? slide : len - 1;
      },
      // Previous slide
      prev: function prev() {
        this.setSlide(this.index - 1, 'prev');
      },
      // Next slide
      next: function next() {
        this.setSlide(this.index + 1, 'next');
      },
      // Pause auto rotation
      pause: function pause(evt) {
        if (!evt) {
          this.isPaused = true;
        }

        if (this._intervalId) {
          clearInterval(this._intervalId);
          this._intervalId = null;
        }
      },
      // Start auto rotate slides
      start: function start(evt) {
        if (!evt) {
          this.isPaused = false;
        }
        /* istanbul ignore next: most likely will never happen, but just in case */


        if (this._intervalId) {
          clearInterval(this._intervalId);
          this._intervalId = null;
        } // Don't start if no interval, or less than 2 slides


        if (this.interval && this.slides.length > 1) {
          this._intervalId = setInterval(this.next, Math.max(1000, this.interval));
        }
      },
      // Restart auto rotate slides when focus/hover leaves the carousel
      restart: function restart(evt)
      /* istanbul ignore next: difficult to test */
      {
        if (!this.$el.contains(document.activeElement)) {
          this.start();
        }
      },
      doSlide: function doSlide(to, from) {
        var _this2 = this;

        var isCycling = Boolean(this.interval); // Determine sliding direction

        var direction = this.calcDirection(this.direction, from, to);
        var overlayClass = direction.overlayClass;
        var dirClass = direction.dirClass; // Determine current and next slides

        var currentSlide = this.slides[from];
        var nextSlide = this.slides[to]; // Don't do anything if there aren't any slides to slide to

        if (!currentSlide || !nextSlide) {
          /* istanbul ignore next */
          return;
        } // Start animating


        this.isSliding = true;

        if (isCycling) {
          this.pause(false);
        }

        this.$emit('sliding-start', to); // Update v-model

        this.$emit('input', this.index);

        if (this.noAnimation) {
          addClass(nextSlide, 'active');
          removeClass(currentSlide, 'active');
          this.isSliding = false; // Notify ourselves that we're done sliding (slid)

          this.$nextTick(function () {
            return _this2.$emit('sliding-end', to);
          });
        } else {
          addClass(nextSlide, overlayClass); // Trigger a reflow of next slide

          reflow(nextSlide);
          addClass(currentSlide, dirClass);
          addClass(nextSlide, dirClass); // Transition End handler

          var called = false;
          /* istanbul ignore next: difficult to test */

          var onceTransEnd = function onceTransEnd(evt) {
            if (called) {
              return;
            }

            called = true;
            /* istanbul ignore if: transition events cant be tested in JSDOM */

            if (_this2.transitionEndEvent) {
              var events = _this2.transitionEndEvent.split(/\s+/);

              events.forEach(function (evt) {
                return eventOff(currentSlide, evt, onceTransEnd, EventOptions$1);
              });
            }

            _this2._animationTimeout = null;
            removeClass(nextSlide, dirClass);
            removeClass(nextSlide, overlayClass);
            addClass(nextSlide, 'active');
            removeClass(currentSlide, 'active');
            removeClass(currentSlide, dirClass);
            removeClass(currentSlide, overlayClass);
            setAttr(currentSlide, 'aria-current', 'false');
            setAttr(nextSlide, 'aria-current', 'true');
            setAttr(currentSlide, 'aria-hidden', 'true');
            setAttr(nextSlide, 'aria-hidden', 'false');
            _this2.isSliding = false;
            _this2.direction = null; // Notify ourselves that we're done sliding (slid)

            _this2.$nextTick(function () {
              return _this2.$emit('sliding-end', to);
            });
          }; // Set up transitionend handler

          /* istanbul ignore if: transition events cant be tested in JSDOM */


          if (this.transitionEndEvent) {
            var events = this.transitionEndEvent.split(/\s+/);
            events.forEach(function (event) {
              return eventOn(currentSlide, event, onceTransEnd, EventOptions$1);
            });
          } // Fallback to setTimeout()


          this._animationTimeout = setTimeout(onceTransEnd, TRANS_DURATION);
        }

        if (isCycling) {
          this.start(false);
        }
      },
      // Update slide list
      updateSlides: function updateSlides() {
        this.pause(true); // Get all slides as DOM elements

        this.slides = selectAll('.carousel-item', this.$refs.inner);
        var numSlides = this.slides.length; // Keep slide number in range

        var index = Math.max(0, Math.min(Math.floor(this.index), numSlides - 1));
        this.slides.forEach(function (slide, idx) {
          var n = idx + 1;

          if (idx === index) {
            addClass(slide, 'active');
            setAttr(slide, 'aria-current', 'true');
          } else {
            removeClass(slide, 'active');
            setAttr(slide, 'aria-current', 'false');
          }

          setAttr(slide, 'aria-posinset', String(n));
          setAttr(slide, 'aria-setsize', String(numSlides));
        }); // Set slide as active

        this.setSlide(index);
        this.start(this.isPaused);
      },
      calcDirection: function calcDirection() {
        var direction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var curIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var nextIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        if (!direction) {
          return nextIndex > curIndex ? DIRECTION.next : DIRECTION.prev;
        }

        return DIRECTION[direction];
      },
      handleClick: function handleClick(evt, fn) {
        var keyCode = evt.keyCode;

        if (evt.type === 'click' || keyCode === KEY_CODES.SPACE || keyCode === KEY_CODES.ENTER) {
          evt.preventDefault();
          evt.stopPropagation();
          fn();
        }
      },
      handleSwipe: function handleSwipe()
      /* istanbul ignore next: JSDOM doesn't support touch events */
      {
        var absDeltaX = Math.abs(this.touchDeltaX);

        if (absDeltaX <= SWIPE_THRESHOLD) {
          return;
        }

        var direction = absDeltaX / this.touchDeltaX;

        if (direction > 0) {
          // Swipe left
          this.prev();
        } else if (direction < 0) {
          // Swipe right
          this.next();
        }
      },
      touchStart: function touchStart(evt)
      /* istanbul ignore next: JSDOM doesn't support touch events */
      {
        if (hasPointerEventSupport && PointerType[evt.pointerType.toUpperCase()]) {
          this.touchStartX = evt.clientX;
        } else if (!hasPointerEventSupport) {
          this.touchStartX = evt.touches[0].clientX;
        }
      },
      touchMove: function touchMove(evt)
      /* istanbul ignore next: JSDOM doesn't support touch events */
      {
        // Ensure swiping with one touch and not pinching
        if (evt.touches && evt.touches.length > 1) {
          this.touchDeltaX = 0;
        } else {
          this.touchDeltaX = evt.touches[0].clientX - this.touchStartX;
        }
      },
      touchEnd: function touchEnd(evt)
      /* istanbul ignore next: JSDOM doesn't support touch events */
      {
        if (hasPointerEventSupport && PointerType[evt.pointerType.toUpperCase()]) {
          this.touchDeltaX = evt.clientX - this.touchStartX;
        }

        this.handleSwipe(); // If it's a touch-enabled device, mouseenter/leave are fired as
        // part of the mouse compatibility events on first tap - the carousel
        // would stop cycling until user tapped out of it;
        // here, we listen for touchend, explicitly pause the carousel
        // (as if it's the second time we tap on it, mouseenter compat event
        // is NOT fired) and after a timeout (to allow for mouse compatibility
        // events to fire) we explicitly restart cycling

        this.pause(false);

        if (this._touchTimeout) {
          clearTimeout(this._touchTimeout);
        }

        this._touchTimeout = setTimeout(this.start, TOUCH_EVENT_COMPAT_WAIT + Math.max(1000, this.interval));
      }
    },
    render: function render(h) {
      var _this3 = this;

      // Wrapper for slides
      var inner = h('div', {
        ref: 'inner',
        class: ['carousel-inner'],
        attrs: {
          id: this.safeId('__BV_inner_'),
          role: 'list'
        }
      }, [this.$slots.default]); // Prev and next controls

      var controls = h(false);

      if (this.controls) {
        controls = [h('a', {
          class: ['carousel-control-prev'],
          attrs: {
            href: '#',
            role: 'button',
            'aria-controls': this.safeId('__BV_inner_')
          },
          on: {
            click: function click(evt) {
              _this3.handleClick(evt, _this3.prev);
            },
            keydown: function keydown(evt) {
              _this3.handleClick(evt, _this3.prev);
            }
          }
        }, [h('span', {
          class: ['carousel-control-prev-icon'],
          attrs: {
            'aria-hidden': 'true'
          }
        }), h('span', {
          class: ['sr-only']
        }, [this.labelPrev])]), h('a', {
          class: ['carousel-control-next'],
          attrs: {
            href: '#',
            role: 'button',
            'aria-controls': this.safeId('__BV_inner_')
          },
          on: {
            click: function click(evt) {
              _this3.handleClick(evt, _this3.next);
            },
            keydown: function keydown(evt) {
              _this3.handleClick(evt, _this3.next);
            }
          }
        }, [h('span', {
          class: ['carousel-control-next-icon'],
          attrs: {
            'aria-hidden': 'true'
          }
        }), h('span', {
          class: ['sr-only']
        }, [this.labelNext])])];
      } // Indicators


      var indicators = h('ol', {
        class: ['carousel-indicators'],
        directives: [{
          name: 'show',
          rawName: 'v-show',
          value: this.indicators,
          expression: 'indicators'
        }],
        attrs: {
          id: this.safeId('__BV_indicators_'),
          'aria-hidden': this.indicators ? 'false' : 'true',
          'aria-label': this.labelIndicators,
          'aria-owns': this.safeId('__BV_inner_')
        }
      }, this.slides.map(function (slide, n) {
        return h('li', {
          key: "slide_".concat(n),
          class: {
            active: n === _this3.index
          },
          attrs: {
            role: 'button',
            id: _this3.safeId("__BV_indicator_".concat(n + 1, "_")),
            tabindex: _this3.indicators ? '0' : '-1',
            'aria-current': n === _this3.index ? 'true' : 'false',
            'aria-label': "".concat(_this3.labelGotoSlide, " ").concat(n + 1),
            'aria-describedby': _this3.slides[n].id || null,
            'aria-controls': _this3.safeId('__BV_inner_')
          },
          on: {
            click: function click(evt) {
              _this3.handleClick(evt, function () {
                _this3.setSlide(n);
              });
            },
            keydown: function keydown(evt) {
              _this3.handleClick(evt, function () {
                _this3.setSlide(n);
              });
            }
          }
        });
      }));
      var on = {
        mouseenter: this.noHoverPause ? noop : this.pause,
        mouseleave: this.noHoverPause ? noop : this.restart,
        focusin: this.pause,
        focusout: this.restart,
        keydown: function keydown(evt) {
          if (/input|textarea/i.test(evt.target.tagName)) {
            /* istanbul ignore next */
            return;
          }

          var keyCode = evt.keyCode;

          if (keyCode === KEY_CODES.LEFT || keyCode === KEY_CODES.RIGHT) {
            evt.preventDefault();
            evt.stopPropagation();

            _this3[keyCode === KEY_CODES.LEFT ? 'prev' : 'next']();
          }
        } // Touch support event handlers for environment

      };

      if (!this.noTouch && hasTouchSupport) {
        // Attach appropriate listeners (prepend event name with '&' for passive mode)

        /* istanbul ignore next: JSDOM doesn't support touch events */
        if (hasPointerEventSupport) {
          on['&pointerdown'] = this.touchStart;
          on['&pointerup'] = this.touchEnd;
        } else {
          on['&touchstart'] = this.touchStart;
          on['&touchmove'] = this.touchMove;
          on['&touchend'] = this.touchEnd;
        }
      } // Return the carousel


      return h('div', {
        staticClass: 'carousel',
        class: {
          slide: !this.noAnimation,
          'carousel-fade': !this.noAnimation && this.fade,
          'pointer-event': !this.noTouch && hasTouchSupport && hasPointerEventSupport
        },
        style: {
          background: this.background
        },
        attrs: {
          role: 'region',
          id: this.safeId(),
          'aria-busy': this.isSliding ? 'true' : 'false'
        },
        on: on
      }, [inner, controls, indicators]);
    }
  });

  var props$k = {
    imgSrc: {
      type: String // default: undefined

    },
    imgAlt: {
      type: String // default: undefined

    },
    imgWidth: {
      type: [Number, String] // default: undefined

    },
    imgHeight: {
      type: [Number, String] // default: undefined

    },
    imgBlank: {
      type: Boolean,
      default: false
    },
    imgBlankColor: {
      type: String,
      default: 'transparent'
    },
    contentVisibleUp: {
      type: String
    },
    contentTag: {
      type: String,
      default: 'div'
    },
    caption: {
      type: String
    },
    captionHtml: {
      type: String
    },
    captionTag: {
      type: String,
      default: 'h3'
    },
    text: {
      type: String
    },
    textHtml: {
      type: String
    },
    textTag: {
      type: String,
      default: 'p'
    },
    background: {
      type: String
    } // @vue/component

  };
  var BCarouselSlide = Vue.extend({
    name: 'BCarouselSlide',
    mixins: [idMixin],
    inject: {
      bvCarousel: {
        default: function _default() {
          return {
            // Explicitly disable touch if not a child of carousel
            noTouch: true
          };
        }
      }
    },
    props: props$k,
    data: function data() {
      return {};
    },
    computed: {
      contentClasses: function contentClasses() {
        return [this.contentVisibleUp ? 'd-none' : '', this.contentVisibleUp ? "d-".concat(this.contentVisibleUp, "-block") : ''];
      },
      computedWidth: function computedWidth() {
        // Use local width, or try parent width
        return this.imgWidth || this.bvCarousel.imgWidth || null;
      },
      computedHeight: function computedHeight() {
        // Use local height, or try parent height
        return this.imgHeight || this.bvCarousel.imgHeight || null;
      }
    },
    render: function render(h) {
      var $slots = this.$slots;
      var noDrag = !this.bvCarousel.noTouch && hasTouchSupport;
      var img = $slots.img;

      if (!img && (this.imgSrc || this.imgBlank)) {
        img = h(BImg, {
          props: {
            fluidGrow: true,
            block: true,
            src: this.imgSrc,
            blank: this.imgBlank,
            blankColor: this.imgBlankColor,
            width: this.computedWidth,
            height: this.computedHeight,
            alt: this.imgAlt
          },
          // Touch support event handler
          on: noDrag ? {
            dragstart: function dragstart(e) {
              /* istanbul ignore next: difficult to test in JSDOM */
              e.preventDefault();
            }
          } : {}
        });
      }

      if (!img) {
        img = h(false);
      }

      var content = h(this.contentTag, {
        staticClass: 'carousel-caption',
        class: this.contentClasses
      }, [this.caption || this.captionHtml ? h(this.captionTag, {
        domProps: htmlOrText(this.captionHtml, this.caption)
      }) : h(false), this.text || this.textHtml ? h(this.textTag, {
        domProps: htmlOrText(this.textHtml, this.text)
      }) : h(false), $slots.default]);
      return h('div', {
        staticClass: 'carousel-item',
        style: {
          background: this.background || this.bvCarousel.background || null
        },
        attrs: {
          id: this.safeId(),
          role: 'listitem'
        }
      }, [img, content]);
    }
  });

  var components$8 = {
    BCarousel: BCarousel,
    BCarouselSlide: BCarouselSlide
  };
  var index$8 = {
    install: installFactory({
      components: components$8
    })
  };

  var props$l = {
    tag: {
      type: String,
      default: 'div'
    },
    fluid: {
      type: Boolean,
      default: false
    } // @vue/component

  };
  var Container = Vue.extend({
    name: 'BContainer',
    functional: true,
    props: props$l,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.tag, mergeData(data, {
        class: {
          container: !props.fluid,
          'container-fluid': props.fluid
        }
      }), children);
    }
  });

  var COMMON_ALIGNMENT = ['start', 'end', 'center'];
  var props$m = {
    tag: {
      type: String,
      default: 'div'
    },
    noGutters: {
      type: Boolean,
      default: false
    },
    alignV: {
      type: String,
      default: null,
      validator: function validator(str) {
        return arrayIncludes(COMMON_ALIGNMENT.concat(['baseline', 'stretch']), str);
      }
    },
    alignH: {
      type: String,
      default: null,
      validator: function validator(str) {
        return arrayIncludes(COMMON_ALIGNMENT.concat(['between', 'around']), str);
      }
    },
    alignContent: {
      type: String,
      default: null,
      validator: function validator(str) {
        return arrayIncludes(COMMON_ALIGNMENT.concat(['between', 'around', 'stretch']), str);
      }
    } // @vue/component

  };
  var BRow = Vue.extend({
    name: 'BRow',
    functional: true,
    props: props$m,
    render: function render(h, _ref) {
      var _class;

      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.tag, mergeData(data, {
        staticClass: 'row',
        class: (_class = {
          'no-gutters': props.noGutters
        }, _defineProperty(_class, "align-items-".concat(props.alignV), props.alignV), _defineProperty(_class, "justify-content-".concat(props.alignH), props.alignH), _defineProperty(_class, "align-content-".concat(props.alignContent), props.alignContent), _class)
      }), children);
    }
  });

  /**
   * Suffix can be a falsey value so nothing is appended to string.
   * (helps when looping over props & some shouldn't change)
   * Use data last parameters to allow for currying.
   * @param {string} suffix
   * @param {string} str
   */

  var suffixPropName = function suffixPropName(suffix, str) {
    return str + (suffix ? upperFirst(suffix) : '');
  };

  /**
   * Generates a prop object with a type of
   * [Boolean, String, Number]
   */

  function boolStrNum() {
    return {
      type: [Boolean, String, Number],
      default: false
    };
  }
  /**
   * Generates a prop object with a type of
   * [String, Number]
   */


  function strNum() {
    return {
      type: [String, Number],
      default: null
    };
  } // Memoized function for better performance on generating class names


  var computeBkPtClass = memoize(function computeBkPt(type, breakpoint, val) {
    var className = type;

    if (isUndefined(val) || isNull(val) || val === false) {
      return undefined;
    }

    if (breakpoint) {
      className += "-".concat(breakpoint);
    } // Handling the boolean style prop when accepting [Boolean, String, Number]
    // means Vue will not convert <b-col sm></b-col> to sm: true for us.
    // Since the default is false, an empty string indicates the prop's presence.


    if (type === 'col' && (val === '' || val === true)) {
      // .col-md
      return className.toLowerCase();
    } // .order-md-6


    className += "-".concat(val);
    return className.toLowerCase();
  }); // Cached copy of the breakpoint prop names

  var breakpointPropMap = create(null); // Lazy evaled props factory for BCol

  var generateProps = function generateProps() {
    // Grab the breakpoints from the cached config (exclude the '' (xs) breakpoint)
    var breakpoints = getBreakpointsUpCached().filter(Boolean); // Supports classes like: .col-sm, .col-md-6, .col-lg-auto

    var breakpointCol = breakpoints.reduce(function (propMap, breakpoint) {
      if (breakpoint) {
        // We filter out the '' breakpoint (xs), as making a prop name ''
        // would not work. The `cols` prop is used for `xs`
        propMap[breakpoint] = boolStrNum();
      }

      return propMap;
    }, create(null)); // Supports classes like: .offset-md-1, .offset-lg-12

    var breakpointOffset = breakpoints.reduce(function (propMap, breakpoint) {
      propMap[suffixPropName(breakpoint, 'offset')] = strNum();
      return propMap;
    }, create(null)); // Supports classes like: .order-md-1, .order-lg-12

    var breakpointOrder = breakpoints.reduce(function (propMap, breakpoint) {
      propMap[suffixPropName(breakpoint, 'order')] = strNum();
      return propMap;
    }, create(null)); // For loop doesn't need to check hasOwnProperty
    // when using an object created from null

    breakpointPropMap = assign$1(create(null), {
      col: keys(breakpointCol),
      offset: keys(breakpointOffset),
      order: keys(breakpointOrder)
    }); // Return the generated props

    return _objectSpread({
      // Generic flexbox .col (xs)
      col: {
        type: Boolean,
        default: false
      },
      // .col-[1-12]|auto  (xs)
      cols: strNum()
    }, breakpointCol, {
      offset: strNum()
    }, breakpointOffset, {
      order: strNum()
    }, breakpointOrder, {
      // Flex alignment
      alignSelf: {
        type: String,
        default: null,
        validator: function validator(str) {
          return arrayIncludes(['auto', 'start', 'end', 'center', 'baseline', 'stretch'], str);
        }
      },
      tag: {
        type: String,
        default: 'div'
      }
    });
  }; // We do not use Vue.extend here as that would evaluate the props
  // immediately, which we do not want to happen
  // @vue/component


  var BCol = {
    name: 'BCol',
    functional: true,

    get props() {
      // Allow props to be lazy evaled on first access and
      // then they become a non-getter afterwards.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Smart_self-overwriting_lazy_getters
      delete this.props; // eslint-disable-next-line no-return-assign

      return this.props = generateProps();
    },

    render: function render(h, _ref) {
      var _classList$push;

      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      var classList = []; // Loop through `col`, `offset`, `order` breakpoint props

      for (var type in breakpointPropMap) {
        // Returns colSm, offset, offsetSm, orderMd, etc.
        var _keys = breakpointPropMap[type];

        for (var i = 0; i < _keys.length; i++) {
          // computeBkPt(col, colSm => Sm, value=[String, Number, Boolean])
          var c = computeBkPtClass(type, _keys[i].replace(type, ''), props[_keys[i]]); // If a class is returned, push it onto the array.

          if (c) {
            classList.push(c);
          }
        }
      }

      var hasColClasses = classList.some(function (className) {
        return /^col-/.test(className);
      });
      classList.push((_classList$push = {
        // Default to .col if no other col-{bp}-* classes generated nor `cols` specified.
        col: props.col || !hasColClasses && !props.cols
      }, _defineProperty(_classList$push, "col-".concat(props.cols), props.cols), _defineProperty(_classList$push, "offset-".concat(props.offset), props.offset), _defineProperty(_classList$push, "order-".concat(props.order), props.order), _defineProperty(_classList$push, "align-self-".concat(props.alignSelf), props.alignSelf), _classList$push));
      return h(props.tag, mergeData(data, {
        class: classList
      }), children);
    }
  };

  var props$n = {
    tag: {
      type: String,
      default: 'div'
    } // @vue/component

  };
  var BFormRow = Vue.extend({
    name: 'BFormRow',
    functional: true,
    props: props$n,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.tag, mergeData(data, {
        staticClass: 'form-row'
      }), children);
    }
  });

  var components$9 = {
    BContainer: Container,
    BRow: BRow,
    BCol: BCol,
    BFormRow: BFormRow
  };
  var index$9 = {
    install: installFactory({
      components: components$9
    })
  };

  /**
   * Issue #569: collapse::toggle::state triggered too many times
   * @link https://github.com/bootstrap-vue/bootstrap-vue/issues/569
   */
  // @vue/component
  var listenOnRootMixin = {
    methods: {
      /**
       * Safely register event listeners on the root Vue node.
       * While Vue automatically removes listeners for individual components,
       * when a component registers a listener on root and is destroyed,
       * this orphans a callback because the node is gone,
       * but the root does not clear the callback.
       *
       * When registering a $root listener, it also registers a listener on
       * the component's `beforeDestroy` hook to automatically remove the
       * event listener from the $root instance.
       *
       * @param {string} event
       * @param {function} callback
       * @chainable
       */
      listenOnRoot: function listenOnRoot(event, callback) {
        var _this = this;

        this.$root.$on(event, callback);
        this.$on('hook:beforeDestroy', function () {
          _this.$root.$off(event, callback);
        }); // Return this for easy chaining

        return this;
      },

      /**
       * Safely register a $once event listener on the root Vue node.
       * While Vue automatically removes listeners for individual components,
       * when a component registers a listener on root and is destroyed,
       * this orphans a callback because the node is gone,
       * but the root does not clear the callback.
       *
       * When registering a $root listener, it also registers a listener on
       * the component's `beforeDestroy` hook to automatically remove the
       * event listener from the $root instance.
       *
       * @param {string} event
       * @param {function} callback
       * @chainable
       */
      listenOnRootOnce: function listenOnRootOnce(event, callback) {
        var _this2 = this;

        this.$root.$once(event, callback);
        this.$on('hook:beforeDestroy', function () {
          _this2.$root.$off(event, callback);
        }); // Return this for easy chaining

        return this;
      },

      /**
       * Convenience method for calling vm.$emit on vm.$root.
       * @param {string} event
       * @param {*} args
       * @chainable
       */
      emitOnRoot: function emitOnRoot(event) {
        var _this$$root;

        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        (_this$$root = this.$root).$emit.apply(_this$$root, [event].concat(args)); // Return this for easy chaining


        return this;
      }
    }
  };

  var EVENT_STATE = 'bv::collapse::state';
  var EVENT_ACCORDION = 'bv::collapse::accordion'; // Private event we emit on $root to ensure the toggle state is always synced
  // Gets emited even if the state has not changed!
  // This event is NOT to be documented as people should not be using it.

  var EVENT_STATE_SYNC = 'bv::collapse::sync::state'; // Events we listen to on $root

  var EVENT_TOGGLE = 'bv::toggle::collapse'; // Event Listener options

  var EventOptions$2 = {
    passive: true,
    capture: false // @vue/component

  };
  var BCollapse = Vue.extend({
    name: 'BCollapse',
    mixins: [listenOnRootMixin],
    model: {
      prop: 'visible',
      event: 'input'
    },
    props: {
      id: {
        type: String,
        required: true
      },
      isNav: {
        type: Boolean,
        default: false
      },
      accordion: {
        type: String,
        default: null
      },
      visible: {
        type: Boolean,
        default: false
      },
      tag: {
        type: String,
        default: 'div'
      }
    },
    data: function data() {
      return {
        show: this.visible,
        transitioning: false
      };
    },
    computed: {
      classObject: function classObject() {
        return {
          'navbar-collapse': this.isNav,
          collapse: !this.transitioning,
          show: this.show && !this.transitioning
        };
      }
    },
    watch: {
      visible: function visible(newVal) {
        if (newVal !== this.show) {
          this.show = newVal;
        }
      },
      show: function show(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.emitState();
        }
      }
    },
    created: function created() {
      this.show = this.visible; // Listen for toggle events to open/close us

      this.listenOnRoot(EVENT_TOGGLE, this.handleToggleEvt); // Listen to other collapses for accordion events

      this.listenOnRoot(EVENT_ACCORDION, this.handleAccordionEvt);
    },
    mounted: function mounted() {
      var _this = this;

      this.show = this.visible;

      if (this.isNav && isBrowser) {
        // Set up handlers
        this.setWindowEvents(true);
        this.handleResize();
      }

      this.$nextTick(function () {
        _this.emitState();
      });
    },
    updated: function updated() {
      // Emit a private event every time this component updates
      // to ensure the toggle button is in sync with the collapse's state.
      // It is emitted regardless if the visible state changes.
      this.$root.$emit(EVENT_STATE_SYNC, this.id, this.show);
    },
    deactivated: function deactivated()
    /* istanbul ignore next */
    {
      if (this.isNav && isBrowser) {
        this.setWindowEvents(false);
      }
    },
    activated: function activated()
    /* istanbul ignore next */
    {
      if (this.isNav && isBrowser) {
        this.setWindowEvents(true);
      }

      this.$root.$emit(EVENT_STATE_SYNC, this.id, this.show);
    },
    beforeDestroy: function beforeDestroy() {
      // Trigger state emit if needed
      this.show = false;

      if (this.isNav && isBrowser) {
        this.setWindowEvents(false);
      }
    },
    methods: {
      setWindowEvents: function setWindowEvents(on) {
        var method = on ? eventOn : eventOff;
        method(window, 'resize', this.handleResize, EventOptions$2);
        method(window, 'orientationchange', this.handleResize, EventOptions$2);
      },
      toggle: function toggle() {
        this.show = !this.show;
      },
      onEnter: function onEnter(el) {
        el.style.height = 0;
        reflow(el);
        el.style.height = el.scrollHeight + 'px';
        this.transitioning = true; // This should be moved out so we can add cancellable events

        this.$emit('show');
      },
      onAfterEnter: function onAfterEnter(el) {
        el.style.height = null;
        this.transitioning = false;
        this.$emit('shown');
      },
      onLeave: function onLeave(el) {
        el.style.height = 'auto';
        el.style.display = 'block';
        el.style.height = getBCR(el).height + 'px';
        reflow(el);
        this.transitioning = true;
        el.style.height = 0; // This should be moved out so we can add cancellable events

        this.$emit('hide');
      },
      onAfterLeave: function onAfterLeave(el) {
        el.style.height = null;
        this.transitioning = false;
        this.$emit('hidden');
      },
      emitState: function emitState() {
        this.$emit('input', this.show); // Let v-b-toggle know the state of this collapse

        this.$root.$emit(EVENT_STATE, this.id, this.show);

        if (this.accordion && this.show) {
          // Tell the other collapses in this accordion to close
          this.$root.$emit(EVENT_ACCORDION, this.id, this.accordion);
        }
      },
      clickHandler: function clickHandler(evt) {
        // If we are in a nav/navbar, close the collapse when non-disabled link clicked
        var el = evt.target;

        if (!this.isNav || !el || getCS(this.$el).display !== 'block') {
          /* istanbul ignore next: can't test getComputedStyle in JSDOM */
          return;
        }

        if (matches(el, '.nav-link,.dropdown-item') || closest('.nav-link,.dropdown-item', el)) {
          this.show = false;
        }
      },
      handleToggleEvt: function handleToggleEvt(target) {
        if (target !== this.id) {
          return;
        }

        this.toggle();
      },
      handleAccordionEvt: function handleAccordionEvt(openedId, accordion) {
        if (!this.accordion || accordion !== this.accordion) {
          return;
        }

        if (openedId === this.id) {
          // Open this collapse if not shown
          if (!this.show) {
            this.toggle();
          }
        } else {
          // Close this collapse if shown
          if (this.show) {
            this.toggle();
          }
        }
      },
      handleResize: function handleResize() {
        // Handler for orientation/resize to set collapsed state in nav/navbar
        this.show = getCS(this.$el).display === 'block';
      }
    },
    render: function render(h) {
      var content = h(this.tag, {
        class: this.classObject,
        directives: [{
          name: 'show',
          value: this.show
        }],
        attrs: {
          id: this.id || null
        },
        on: {
          click: this.clickHandler
        }
      }, [this.$slots.default]);
      return h('transition', {
        props: {
          enterClass: '',
          enterActiveClass: 'collapsing',
          enterToClass: '',
          leaveClass: '',
          leaveActiveClass: 'collapsing',
          leaveToClass: ''
        },
        on: {
          enter: this.onEnter,
          afterEnter: this.onAfterEnter,
          leave: this.onLeave,
          afterLeave: this.onAfterLeave
        }
      }, [content]);
    }
  });

  var allListenTypes = {
    hover: true,
    click: true,
    focus: true
  };
  var BVBoundListeners = '__BV_boundEventListeners__';

  var bindTargets = function bindTargets(vnode, binding, listenTypes, fn) {
    var targets = keys(binding.modifiers || {}).filter(function (t) {
      return !allListenTypes[t];
    });

    if (binding.value) {
      targets.push(binding.value);
    }

    var listener = function listener() {
      fn({
        targets: targets,
        vnode: vnode
      });
    };

    keys(allListenTypes).forEach(function (type) {
      if (listenTypes[type] || binding.modifiers[type]) {
        eventOn(vnode.elm, type, listener);
        var boundListeners = vnode.elm[BVBoundListeners] || {};
        boundListeners[type] = boundListeners[type] || [];
        boundListeners[type].push(listener);
        vnode.elm[BVBoundListeners] = boundListeners;
      }
    }); // Return the list of targets

    return targets;
  };

  var unbindTargets = function unbindTargets(vnode, binding, listenTypes) {
    keys(allListenTypes).forEach(function (type) {
      if (listenTypes[type] || binding.modifiers[type]) {
        var boundListeners = vnode.elm[BVBoundListeners] && vnode.elm[BVBoundListeners][type];

        if (boundListeners) {
          boundListeners.forEach(function (listener) {
            return eventOff(vnode.elm, type, listener);
          });
          delete vnode.elm[BVBoundListeners][type];
        }
      }
    });
  };

  var listenTypes = {
    click: true // Property key for handler storage

  };
  var BV_TOGGLE = '__BV_toggle__';
  var BV_TOGGLE_STATE = '__BV_toggle_STATE__';
  var BV_TOGGLE_CONTROLS = '__BV_toggle_CONTROLS__';
  var BV_TOGGLE_TARGETS = '__BV_toggle_TARGETS__'; // Emitted control event for collapse (emitted to collapse)

  var EVENT_TOGGLE$1 = 'bv::toggle::collapse'; // Listen to event for toggle state update (emitted by collapse)

  var EVENT_STATE$1 = 'bv::collapse::state'; // Private event emitted on $root to ensure the toggle state is always synced.
  // Gets emitted even if the state of b-collapse has not changed.
  // This event is NOT to be documented as people should not be using it.

  var EVENT_STATE_SYNC$1 = 'bv::collapse::sync::state'; // Reset and remove a property from the provided element

  var resetProp = function resetProp(el, prop) {
    el[prop] = null;
    delete el[prop];
  }; // Handle directive updates

  /* istanbul ignore next: not easy to test */


  var handleUpdate = function handleUpdate(el, binding, vnode) {
    if (!isBrowser) {
      return;
    } // Ensure the collapse class and aria-* attributes persist
    // after element is updated (either by parent re-rendering
    // or changes to this element or it's contents


    if (el[BV_TOGGLE_STATE] === true) {
      addClass(el, 'collapsed');
      setAttr(el, 'aria-expanded', 'true');
    } else if (el[BV_TOGGLE_STATE] === false) {
      removeClass(el, 'collapsed');
      setAttr(el, 'aria-expanded', 'false');
    }

    setAttr(el, 'aria-controls', el[BV_TOGGLE_CONTROLS]);
  };
  /*
   * Export our directive
   */


  var BToggleDirective = {
    bind: function bind(el, binding, vnode) {
      var targets = bindTargets(vnode, binding, listenTypes, function (_ref) {
        var targets = _ref.targets,
            vnode = _ref.vnode;
        targets.forEach(function (target) {
          vnode.context.$root.$emit(EVENT_TOGGLE$1, target);
        });
      });

      if (isBrowser && vnode.context && targets.length > 0) {
        // Add targets array to element
        el[BV_TOGGLE_TARGETS] = targets; // Add aria attributes to element

        el[BV_TOGGLE_CONTROLS] = targets.join(' '); // State is initially collapsed until we receive a state event

        el[BV_TOGGLE_STATE] = false;
        setAttr(el, 'aria-controls', el[BV_TOGGLE_CONTROLS]);
        setAttr(el, 'aria-expanded', 'false'); // If element is not a button, we add `role="button"` for accessibility

        if (el.tagName !== 'BUTTON') {
          setAttr(el, 'role', 'button');
        } // Toggle state handler, stored on element


        el[BV_TOGGLE] = function toggleDirectiveHandler(id, state) {
          var targets = el[BV_TOGGLE_TARGETS] || [];

          if (targets.indexOf(id) !== -1) {
            // Set aria-expanded state
            setAttr(el, 'aria-expanded', state ? 'true' : 'false'); // Set/Clear 'collapsed' class state

            el[BV_TOGGLE_STATE] = state;

            if (state) {
              removeClass(el, 'collapsed');
            } else {
              addClass(el, 'collapsed');
            }
          }
        }; // Listen for toggle state changes (public)


        vnode.context.$root.$on(EVENT_STATE$1, el[BV_TOGGLE]); // Listen for toggle state sync (private)

        vnode.context.$root.$on(EVENT_STATE_SYNC$1, el[BV_TOGGLE]);
      }
    },
    componentUpdated: handleUpdate,
    updated: handleUpdate,
    unbind: function unbind(el, binding, vnode)
    /* istanbul ignore next */
    {
      unbindTargets(vnode, binding, listenTypes); // Remove our $root listener

      if (el[BV_TOGGLE]) {
        vnode.context.$root.$off(EVENT_STATE$1, el[BV_TOGGLE]);
        vnode.context.$root.$off(EVENT_STATE_SYNC$1, el[BV_TOGGLE]);
      } // Reset custom  props


      resetProp(el, BV_TOGGLE);
      resetProp(el, BV_TOGGLE_STATE);
      resetProp(el, BV_TOGGLE_CONTROLS);
      resetProp(el, BV_TOGGLE_TARGETS); // Reset classes/attrs

      removeClass(el, 'collapsed');
      removeAttr(el, 'aria-expanded');
      removeAttr(el, 'aria-controls');
      removeAttr(el, 'role');
    }
  };

  var components$a = {
    BCollapse: BCollapse
  };
  var directives = {
    BToggle: BToggleDirective
  };
  var CollapsePlugin = {
    install: installFactory({
      components: components$a,
      directives: directives
    })
  };

  /**!
   * @fileOverview Kickass library to create and place poppers near their reference elements.
   * @version 1.15.0
   * @license
   * Copyright (c) 2016 Federico Zivolo and contributors
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   */
  var isBrowser$1 = typeof window !== 'undefined' && typeof document !== 'undefined';

  var longerTimeoutBrowsers = ['Edge', 'Trident', 'Firefox'];
  var timeoutDuration = 0;
  for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
    if (isBrowser$1 && navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0) {
      timeoutDuration = 1;
      break;
    }
  }

  function microtaskDebounce(fn) {
    var called = false;
    return function () {
      if (called) {
        return;
      }
      called = true;
      window.Promise.resolve().then(function () {
        called = false;
        fn();
      });
    };
  }

  function taskDebounce(fn) {
    var scheduled = false;
    return function () {
      if (!scheduled) {
        scheduled = true;
        setTimeout(function () {
          scheduled = false;
          fn();
        }, timeoutDuration);
      }
    };
  }

  var supportsMicroTasks = isBrowser$1 && window.Promise;

  /**
  * Create a debounced version of a method, that's asynchronously deferred
  * but called in the minimum time possible.
  *
  * @method
  * @memberof Popper.Utils
  * @argument {Function} fn
  * @returns {Function}
  */
  var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

  /**
   * Check if the given variable is a function
   * @method
   * @memberof Popper.Utils
   * @argument {Any} functionToCheck - variable to check
   * @returns {Boolean} answer to: is a function?
   */
  function isFunction$1(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  }

  /**
   * Get CSS computed property of the given element
   * @method
   * @memberof Popper.Utils
   * @argument {Eement} element
   * @argument {String} property
   */
  function getStyleComputedProperty(element, property) {
    if (element.nodeType !== 1) {
      return [];
    }
    // NOTE: 1 DOM access here
    var window = element.ownerDocument.defaultView;
    var css = window.getComputedStyle(element, null);
    return property ? css[property] : css;
  }

  /**
   * Returns the parentNode or the host of the element
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Element} parent
   */
  function getParentNode(element) {
    if (element.nodeName === 'HTML') {
      return element;
    }
    return element.parentNode || element.host;
  }

  /**
   * Returns the scrolling parent of the given element
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Element} scroll parent
   */
  function getScrollParent(element) {
    // Return body, `getScroll` will take care to get the correct `scrollTop` from it
    if (!element) {
      return document.body;
    }

    switch (element.nodeName) {
      case 'HTML':
      case 'BODY':
        return element.ownerDocument.body;
      case '#document':
        return element.body;
    }

    // Firefox want us to check `-x` and `-y` variations as well

    var _getStyleComputedProp = getStyleComputedProperty(element),
        overflow = _getStyleComputedProp.overflow,
        overflowX = _getStyleComputedProp.overflowX,
        overflowY = _getStyleComputedProp.overflowY;

    if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
      return element;
    }

    return getScrollParent(getParentNode(element));
  }

  var isIE11 = isBrowser$1 && !!(window.MSInputMethodContext && document.documentMode);
  var isIE10 = isBrowser$1 && /MSIE 10/.test(navigator.userAgent);

  /**
   * Determines if the browser is Internet Explorer
   * @method
   * @memberof Popper.Utils
   * @param {Number} version to check
   * @returns {Boolean} isIE
   */
  function isIE(version) {
    if (version === 11) {
      return isIE11;
    }
    if (version === 10) {
      return isIE10;
    }
    return isIE11 || isIE10;
  }

  /**
   * Returns the offset parent of the given element
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Element} offset parent
   */
  function getOffsetParent(element) {
    if (!element) {
      return document.documentElement;
    }

    var noOffsetParent = isIE(10) ? document.body : null;

    // NOTE: 1 DOM access here
    var offsetParent = element.offsetParent || null;
    // Skip hidden elements which don't have an offsetParent
    while (offsetParent === noOffsetParent && element.nextElementSibling) {
      offsetParent = (element = element.nextElementSibling).offsetParent;
    }

    var nodeName = offsetParent && offsetParent.nodeName;

    if (!nodeName || nodeName === 'BODY' || nodeName === 'HTML') {
      return element ? element.ownerDocument.documentElement : document.documentElement;
    }

    // .offsetParent will return the closest TH, TD or TABLE in case
    // no offsetParent is present, I hate this job...
    if (['TH', 'TD', 'TABLE'].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, 'position') === 'static') {
      return getOffsetParent(offsetParent);
    }

    return offsetParent;
  }

  function isOffsetContainer(element) {
    var nodeName = element.nodeName;

    if (nodeName === 'BODY') {
      return false;
    }
    return nodeName === 'HTML' || getOffsetParent(element.firstElementChild) === element;
  }

  /**
   * Finds the root node (document, shadowDOM root) of the given element
   * @method
   * @memberof Popper.Utils
   * @argument {Element} node
   * @returns {Element} root node
   */
  function getRoot(node) {
    if (node.parentNode !== null) {
      return getRoot(node.parentNode);
    }

    return node;
  }

  /**
   * Finds the offset parent common to the two provided nodes
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element1
   * @argument {Element} element2
   * @returns {Element} common offset parent
   */
  function findCommonOffsetParent(element1, element2) {
    // This check is needed to avoid errors in case one of the elements isn't defined for any reason
    if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
      return document.documentElement;
    }

    // Here we make sure to give as "start" the element that comes first in the DOM
    var order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
    var start = order ? element1 : element2;
    var end = order ? element2 : element1;

    // Get common ancestor container
    var range = document.createRange();
    range.setStart(start, 0);
    range.setEnd(end, 0);
    var commonAncestorContainer = range.commonAncestorContainer;

    // Both nodes are inside #document

    if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start.contains(end)) {
      if (isOffsetContainer(commonAncestorContainer)) {
        return commonAncestorContainer;
      }

      return getOffsetParent(commonAncestorContainer);
    }

    // one of the nodes is inside shadowDOM, find which one
    var element1root = getRoot(element1);
    if (element1root.host) {
      return findCommonOffsetParent(element1root.host, element2);
    } else {
      return findCommonOffsetParent(element1, getRoot(element2).host);
    }
  }

  /**
   * Gets the scroll value of the given element in the given side (top and left)
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @argument {String} side `top` or `left`
   * @returns {number} amount of scrolled pixels
   */
  function getScroll(element) {
    var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';

    var upperSide = side === 'top' ? 'scrollTop' : 'scrollLeft';
    var nodeName = element.nodeName;

    if (nodeName === 'BODY' || nodeName === 'HTML') {
      var html = element.ownerDocument.documentElement;
      var scrollingElement = element.ownerDocument.scrollingElement || html;
      return scrollingElement[upperSide];
    }

    return element[upperSide];
  }

  /*
   * Sum or subtract the element scroll values (left and top) from a given rect object
   * @method
   * @memberof Popper.Utils
   * @param {Object} rect - Rect object you want to change
   * @param {HTMLElement} element - The element from the function reads the scroll values
   * @param {Boolean} subtract - set to true if you want to subtract the scroll values
   * @return {Object} rect - The modifier rect object
   */
  function includeScroll(rect, element) {
    var subtract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var scrollTop = getScroll(element, 'top');
    var scrollLeft = getScroll(element, 'left');
    var modifier = subtract ? -1 : 1;
    rect.top += scrollTop * modifier;
    rect.bottom += scrollTop * modifier;
    rect.left += scrollLeft * modifier;
    rect.right += scrollLeft * modifier;
    return rect;
  }

  /*
   * Helper to detect borders of a given element
   * @method
   * @memberof Popper.Utils
   * @param {CSSStyleDeclaration} styles
   * Result of `getStyleComputedProperty` on the given element
   * @param {String} axis - `x` or `y`
   * @return {number} borders - The borders size of the given axis
   */

  function getBordersSize(styles, axis) {
    var sideA = axis === 'x' ? 'Left' : 'Top';
    var sideB = sideA === 'Left' ? 'Right' : 'Bottom';

    return parseFloat(styles['border' + sideA + 'Width'], 10) + parseFloat(styles['border' + sideB + 'Width'], 10);
  }

  function getSize(axis, body, html, computedStyle) {
    return Math.max(body['offset' + axis], body['scroll' + axis], html['client' + axis], html['offset' + axis], html['scroll' + axis], isIE(10) ? parseInt(html['offset' + axis]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Top' : 'Left')]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Bottom' : 'Right')]) : 0);
  }

  function getWindowSizes(document) {
    var body = document.body;
    var html = document.documentElement;
    var computedStyle = isIE(10) && getComputedStyle(html);

    return {
      height: getSize('Height', body, html, computedStyle),
      width: getSize('Width', body, html, computedStyle)
    };
  }

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();





  var defineProperty$1 = function (obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  };

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  /**
   * Given element offsets, generate an output similar to getBoundingClientRect
   * @method
   * @memberof Popper.Utils
   * @argument {Object} offsets
   * @returns {Object} ClientRect like output
   */
  function getClientRect(offsets) {
    return _extends({}, offsets, {
      right: offsets.left + offsets.width,
      bottom: offsets.top + offsets.height
    });
  }

  /**
   * Get bounding client rect of given element
   * @method
   * @memberof Popper.Utils
   * @param {HTMLElement} element
   * @return {Object} client rect
   */
  function getBoundingClientRect(element) {
    var rect = {};

    // IE10 10 FIX: Please, don't ask, the element isn't
    // considered in DOM in some circumstances...
    // This isn't reproducible in IE10 compatibility mode of IE11
    try {
      if (isIE(10)) {
        rect = element.getBoundingClientRect();
        var scrollTop = getScroll(element, 'top');
        var scrollLeft = getScroll(element, 'left');
        rect.top += scrollTop;
        rect.left += scrollLeft;
        rect.bottom += scrollTop;
        rect.right += scrollLeft;
      } else {
        rect = element.getBoundingClientRect();
      }
    } catch (e) {}

    var result = {
      left: rect.left,
      top: rect.top,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top
    };

    // subtract scrollbar size from sizes
    var sizes = element.nodeName === 'HTML' ? getWindowSizes(element.ownerDocument) : {};
    var width = sizes.width || element.clientWidth || result.right - result.left;
    var height = sizes.height || element.clientHeight || result.bottom - result.top;

    var horizScrollbar = element.offsetWidth - width;
    var vertScrollbar = element.offsetHeight - height;

    // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
    // we make this check conditional for performance reasons
    if (horizScrollbar || vertScrollbar) {
      var styles = getStyleComputedProperty(element);
      horizScrollbar -= getBordersSize(styles, 'x');
      vertScrollbar -= getBordersSize(styles, 'y');

      result.width -= horizScrollbar;
      result.height -= vertScrollbar;
    }

    return getClientRect(result);
  }

  function getOffsetRectRelativeToArbitraryNode(children, parent) {
    var fixedPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var isIE10 = isIE(10);
    var isHTML = parent.nodeName === 'HTML';
    var childrenRect = getBoundingClientRect(children);
    var parentRect = getBoundingClientRect(parent);
    var scrollParent = getScrollParent(children);

    var styles = getStyleComputedProperty(parent);
    var borderTopWidth = parseFloat(styles.borderTopWidth, 10);
    var borderLeftWidth = parseFloat(styles.borderLeftWidth, 10);

    // In cases where the parent is fixed, we must ignore negative scroll in offset calc
    if (fixedPosition && isHTML) {
      parentRect.top = Math.max(parentRect.top, 0);
      parentRect.left = Math.max(parentRect.left, 0);
    }
    var offsets = getClientRect({
      top: childrenRect.top - parentRect.top - borderTopWidth,
      left: childrenRect.left - parentRect.left - borderLeftWidth,
      width: childrenRect.width,
      height: childrenRect.height
    });
    offsets.marginTop = 0;
    offsets.marginLeft = 0;

    // Subtract margins of documentElement in case it's being used as parent
    // we do this only on HTML because it's the only element that behaves
    // differently when margins are applied to it. The margins are included in
    // the box of the documentElement, in the other cases not.
    if (!isIE10 && isHTML) {
      var marginTop = parseFloat(styles.marginTop, 10);
      var marginLeft = parseFloat(styles.marginLeft, 10);

      offsets.top -= borderTopWidth - marginTop;
      offsets.bottom -= borderTopWidth - marginTop;
      offsets.left -= borderLeftWidth - marginLeft;
      offsets.right -= borderLeftWidth - marginLeft;

      // Attach marginTop and marginLeft because in some circumstances we may need them
      offsets.marginTop = marginTop;
      offsets.marginLeft = marginLeft;
    }

    if (isIE10 && !fixedPosition ? parent.contains(scrollParent) : parent === scrollParent && scrollParent.nodeName !== 'BODY') {
      offsets = includeScroll(offsets, parent);
    }

    return offsets;
  }

  function getViewportOffsetRectRelativeToArtbitraryNode(element) {
    var excludeScroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var html = element.ownerDocument.documentElement;
    var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
    var width = Math.max(html.clientWidth, window.innerWidth || 0);
    var height = Math.max(html.clientHeight, window.innerHeight || 0);

    var scrollTop = !excludeScroll ? getScroll(html) : 0;
    var scrollLeft = !excludeScroll ? getScroll(html, 'left') : 0;

    var offset = {
      top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
      left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
      width: width,
      height: height
    };

    return getClientRect(offset);
  }

  /**
   * Check if the given element is fixed or is inside a fixed parent
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @argument {Element} customContainer
   * @returns {Boolean} answer to "isFixed?"
   */
  function isFixed(element) {
    var nodeName = element.nodeName;
    if (nodeName === 'BODY' || nodeName === 'HTML') {
      return false;
    }
    if (getStyleComputedProperty(element, 'position') === 'fixed') {
      return true;
    }
    var parentNode = getParentNode(element);
    if (!parentNode) {
      return false;
    }
    return isFixed(parentNode);
  }

  /**
   * Finds the first parent of an element that has a transformed property defined
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Element} first transformed parent or documentElement
   */

  function getFixedPositionOffsetParent(element) {
    // This check is needed to avoid errors in case one of the elements isn't defined for any reason
    if (!element || !element.parentElement || isIE()) {
      return document.documentElement;
    }
    var el = element.parentElement;
    while (el && getStyleComputedProperty(el, 'transform') === 'none') {
      el = el.parentElement;
    }
    return el || document.documentElement;
  }

  /**
   * Computed the boundaries limits and return them
   * @method
   * @memberof Popper.Utils
   * @param {HTMLElement} popper
   * @param {HTMLElement} reference
   * @param {number} padding
   * @param {HTMLElement} boundariesElement - Element used to define the boundaries
   * @param {Boolean} fixedPosition - Is in fixed position mode
   * @returns {Object} Coordinates of the boundaries
   */
  function getBoundaries(popper, reference, padding, boundariesElement) {
    var fixedPosition = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    // NOTE: 1 DOM access here

    var boundaries = { top: 0, left: 0 };
    var offsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, reference);

    // Handle viewport case
    if (boundariesElement === 'viewport') {
      boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent, fixedPosition);
    } else {
      // Handle other cases based on DOM element used as boundaries
      var boundariesNode = void 0;
      if (boundariesElement === 'scrollParent') {
        boundariesNode = getScrollParent(getParentNode(reference));
        if (boundariesNode.nodeName === 'BODY') {
          boundariesNode = popper.ownerDocument.documentElement;
        }
      } else if (boundariesElement === 'window') {
        boundariesNode = popper.ownerDocument.documentElement;
      } else {
        boundariesNode = boundariesElement;
      }

      var offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent, fixedPosition);

      // In case of HTML, we need a different computation
      if (boundariesNode.nodeName === 'HTML' && !isFixed(offsetParent)) {
        var _getWindowSizes = getWindowSizes(popper.ownerDocument),
            height = _getWindowSizes.height,
            width = _getWindowSizes.width;

        boundaries.top += offsets.top - offsets.marginTop;
        boundaries.bottom = height + offsets.top;
        boundaries.left += offsets.left - offsets.marginLeft;
        boundaries.right = width + offsets.left;
      } else {
        // for all the other DOM elements, this one is good
        boundaries = offsets;
      }
    }

    // Add paddings
    padding = padding || 0;
    var isPaddingNumber = typeof padding === 'number';
    boundaries.left += isPaddingNumber ? padding : padding.left || 0;
    boundaries.top += isPaddingNumber ? padding : padding.top || 0;
    boundaries.right -= isPaddingNumber ? padding : padding.right || 0;
    boundaries.bottom -= isPaddingNumber ? padding : padding.bottom || 0;

    return boundaries;
  }

  function getArea(_ref) {
    var width = _ref.width,
        height = _ref.height;

    return width * height;
  }

  /**
   * Utility used to transform the `auto` placement to the placement with more
   * available space.
   * @method
   * @memberof Popper.Utils
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function computeAutoPlacement(placement, refRect, popper, reference, boundariesElement) {
    var padding = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

    if (placement.indexOf('auto') === -1) {
      return placement;
    }

    var boundaries = getBoundaries(popper, reference, padding, boundariesElement);

    var rects = {
      top: {
        width: boundaries.width,
        height: refRect.top - boundaries.top
      },
      right: {
        width: boundaries.right - refRect.right,
        height: boundaries.height
      },
      bottom: {
        width: boundaries.width,
        height: boundaries.bottom - refRect.bottom
      },
      left: {
        width: refRect.left - boundaries.left,
        height: boundaries.height
      }
    };

    var sortedAreas = Object.keys(rects).map(function (key) {
      return _extends({
        key: key
      }, rects[key], {
        area: getArea(rects[key])
      });
    }).sort(function (a, b) {
      return b.area - a.area;
    });

    var filteredAreas = sortedAreas.filter(function (_ref2) {
      var width = _ref2.width,
          height = _ref2.height;
      return width >= popper.clientWidth && height >= popper.clientHeight;
    });

    var computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;

    var variation = placement.split('-')[1];

    return computedPlacement + (variation ? '-' + variation : '');
  }

  /**
   * Get offsets to the reference element
   * @method
   * @memberof Popper.Utils
   * @param {Object} state
   * @param {Element} popper - the popper element
   * @param {Element} reference - the reference element (the popper will be relative to this)
   * @param {Element} fixedPosition - is in fixed position mode
   * @returns {Object} An object containing the offsets which will be applied to the popper
   */
  function getReferenceOffsets(state, popper, reference) {
    var fixedPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    var commonOffsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, reference);
    return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent, fixedPosition);
  }

  /**
   * Get the outer sizes of the given element (offset size + margins)
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Object} object containing width and height properties
   */
  function getOuterSizes(element) {
    var window = element.ownerDocument.defaultView;
    var styles = window.getComputedStyle(element);
    var x = parseFloat(styles.marginTop || 0) + parseFloat(styles.marginBottom || 0);
    var y = parseFloat(styles.marginLeft || 0) + parseFloat(styles.marginRight || 0);
    var result = {
      width: element.offsetWidth + y,
      height: element.offsetHeight + x
    };
    return result;
  }

  /**
   * Get the opposite placement of the given one
   * @method
   * @memberof Popper.Utils
   * @argument {String} placement
   * @returns {String} flipped placement
   */
  function getOppositePlacement(placement) {
    var hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
    return placement.replace(/left|right|bottom|top/g, function (matched) {
      return hash[matched];
    });
  }

  /**
   * Get offsets to the popper
   * @method
   * @memberof Popper.Utils
   * @param {Object} position - CSS position the Popper will get applied
   * @param {HTMLElement} popper - the popper element
   * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
   * @param {String} placement - one of the valid placement options
   * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
   */
  function getPopperOffsets(popper, referenceOffsets, placement) {
    placement = placement.split('-')[0];

    // Get popper node sizes
    var popperRect = getOuterSizes(popper);

    // Add position, width and height to our offsets object
    var popperOffsets = {
      width: popperRect.width,
      height: popperRect.height
    };

    // depending by the popper placement we have to compute its offsets slightly differently
    var isHoriz = ['right', 'left'].indexOf(placement) !== -1;
    var mainSide = isHoriz ? 'top' : 'left';
    var secondarySide = isHoriz ? 'left' : 'top';
    var measurement = isHoriz ? 'height' : 'width';
    var secondaryMeasurement = !isHoriz ? 'height' : 'width';

    popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
    if (placement === secondarySide) {
      popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
    } else {
      popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
    }

    return popperOffsets;
  }

  /**
   * Mimics the `find` method of Array
   * @method
   * @memberof Popper.Utils
   * @argument {Array} arr
   * @argument prop
   * @argument value
   * @returns index or -1
   */
  function find(arr, check) {
    // use native find if supported
    if (Array.prototype.find) {
      return arr.find(check);
    }

    // use `filter` to obtain the same behavior of `find`
    return arr.filter(check)[0];
  }

  /**
   * Return the index of the matching object
   * @method
   * @memberof Popper.Utils
   * @argument {Array} arr
   * @argument prop
   * @argument value
   * @returns index or -1
   */
  function findIndex(arr, prop, value) {
    // use native findIndex if supported
    if (Array.prototype.findIndex) {
      return arr.findIndex(function (cur) {
        return cur[prop] === value;
      });
    }

    // use `find` + `indexOf` if `findIndex` isn't supported
    var match = find(arr, function (obj) {
      return obj[prop] === value;
    });
    return arr.indexOf(match);
  }

  /**
   * Loop trough the list of modifiers and run them in order,
   * each of them will then edit the data object.
   * @method
   * @memberof Popper.Utils
   * @param {dataObject} data
   * @param {Array} modifiers
   * @param {String} ends - Optional modifier name used as stopper
   * @returns {dataObject}
   */
  function runModifiers(modifiers, data, ends) {
    var modifiersToRun = ends === undefined ? modifiers : modifiers.slice(0, findIndex(modifiers, 'name', ends));

    modifiersToRun.forEach(function (modifier) {
      if (modifier['function']) {
        // eslint-disable-line dot-notation
        console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
      }
      var fn = modifier['function'] || modifier.fn; // eslint-disable-line dot-notation
      if (modifier.enabled && isFunction$1(fn)) {
        // Add properties to offsets to make them a complete clientRect object
        // we do this before each modifier to make sure the previous one doesn't
        // mess with these values
        data.offsets.popper = getClientRect(data.offsets.popper);
        data.offsets.reference = getClientRect(data.offsets.reference);

        data = fn(data, modifier);
      }
    });

    return data;
  }

  /**
   * Updates the position of the popper, computing the new offsets and applying
   * the new style.<br />
   * Prefer `scheduleUpdate` over `update` because of performance reasons.
   * @method
   * @memberof Popper
   */
  function update() {
    // if popper is destroyed, don't perform any further update
    if (this.state.isDestroyed) {
      return;
    }

    var data = {
      instance: this,
      styles: {},
      arrowStyles: {},
      attributes: {},
      flipped: false,
      offsets: {}
    };

    // compute reference element offsets
    data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference, this.options.positionFixed);

    // compute auto placement, store placement inside the data object,
    // modifiers will be able to edit `placement` if needed
    // and refer to originalPlacement to know the original value
    data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding);

    // store the computed placement inside `originalPlacement`
    data.originalPlacement = data.placement;

    data.positionFixed = this.options.positionFixed;

    // compute the popper offsets
    data.offsets.popper = getPopperOffsets(this.popper, data.offsets.reference, data.placement);

    data.offsets.popper.position = this.options.positionFixed ? 'fixed' : 'absolute';

    // run the modifiers
    data = runModifiers(this.modifiers, data);

    // the first `update` will call `onCreate` callback
    // the other ones will call `onUpdate` callback
    if (!this.state.isCreated) {
      this.state.isCreated = true;
      this.options.onCreate(data);
    } else {
      this.options.onUpdate(data);
    }
  }

  /**
   * Helper used to know if the given modifier is enabled.
   * @method
   * @memberof Popper.Utils
   * @returns {Boolean}
   */
  function isModifierEnabled(modifiers, modifierName) {
    return modifiers.some(function (_ref) {
      var name = _ref.name,
          enabled = _ref.enabled;
      return enabled && name === modifierName;
    });
  }

  /**
   * Get the prefixed supported property name
   * @method
   * @memberof Popper.Utils
   * @argument {String} property (camelCase)
   * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
   */
  function getSupportedPropertyName(property) {
    var prefixes = [false, 'ms', 'Webkit', 'Moz', 'O'];
    var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

    for (var i = 0; i < prefixes.length; i++) {
      var prefix = prefixes[i];
      var toCheck = prefix ? '' + prefix + upperProp : property;
      if (typeof document.body.style[toCheck] !== 'undefined') {
        return toCheck;
      }
    }
    return null;
  }

  /**
   * Destroys the popper.
   * @method
   * @memberof Popper
   */
  function destroy() {
    this.state.isDestroyed = true;

    // touch DOM only if `applyStyle` modifier is enabled
    if (isModifierEnabled(this.modifiers, 'applyStyle')) {
      this.popper.removeAttribute('x-placement');
      this.popper.style.position = '';
      this.popper.style.top = '';
      this.popper.style.left = '';
      this.popper.style.right = '';
      this.popper.style.bottom = '';
      this.popper.style.willChange = '';
      this.popper.style[getSupportedPropertyName('transform')] = '';
    }

    this.disableEventListeners();

    // remove the popper if user explicity asked for the deletion on destroy
    // do not use `remove` because IE11 doesn't support it
    if (this.options.removeOnDestroy) {
      this.popper.parentNode.removeChild(this.popper);
    }
    return this;
  }

  /**
   * Get the window associated with the element
   * @argument {Element} element
   * @returns {Window}
   */
  function getWindow(element) {
    var ownerDocument = element.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView : window;
  }

  function attachToScrollParents(scrollParent, event, callback, scrollParents) {
    var isBody = scrollParent.nodeName === 'BODY';
    var target = isBody ? scrollParent.ownerDocument.defaultView : scrollParent;
    target.addEventListener(event, callback, { passive: true });

    if (!isBody) {
      attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
    }
    scrollParents.push(target);
  }

  /**
   * Setup needed event listeners used to update the popper position
   * @method
   * @memberof Popper.Utils
   * @private
   */
  function setupEventListeners(reference, options, state, updateBound) {
    // Resize event listener on window
    state.updateBound = updateBound;
    getWindow(reference).addEventListener('resize', state.updateBound, { passive: true });

    // Scroll event listener on scroll parents
    var scrollElement = getScrollParent(reference);
    attachToScrollParents(scrollElement, 'scroll', state.updateBound, state.scrollParents);
    state.scrollElement = scrollElement;
    state.eventsEnabled = true;

    return state;
  }

  /**
   * It will add resize/scroll events and start recalculating
   * position of the popper element when they are triggered.
   * @method
   * @memberof Popper
   */
  function enableEventListeners() {
    if (!this.state.eventsEnabled) {
      this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
    }
  }

  /**
   * Remove event listeners used to update the popper position
   * @method
   * @memberof Popper.Utils
   * @private
   */
  function removeEventListeners(reference, state) {
    // Remove resize event listener on window
    getWindow(reference).removeEventListener('resize', state.updateBound);

    // Remove scroll event listener on scroll parents
    state.scrollParents.forEach(function (target) {
      target.removeEventListener('scroll', state.updateBound);
    });

    // Reset state
    state.updateBound = null;
    state.scrollParents = [];
    state.scrollElement = null;
    state.eventsEnabled = false;
    return state;
  }

  /**
   * It will remove resize/scroll events and won't recalculate popper position
   * when they are triggered. It also won't trigger `onUpdate` callback anymore,
   * unless you call `update` method manually.
   * @method
   * @memberof Popper
   */
  function disableEventListeners() {
    if (this.state.eventsEnabled) {
      cancelAnimationFrame(this.scheduleUpdate);
      this.state = removeEventListeners(this.reference, this.state);
    }
  }

  /**
   * Tells if a given input is a number
   * @method
   * @memberof Popper.Utils
   * @param {*} input to check
   * @return {Boolean}
   */
  function isNumeric(n) {
    return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
  }

  /**
   * Set the style to the given popper
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element - Element to apply the style to
   * @argument {Object} styles
   * Object with a list of properties and values which will be applied to the element
   */
  function setStyles(element, styles) {
    Object.keys(styles).forEach(function (prop) {
      var unit = '';
      // add unit if the value is numeric and is one of the following
      if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
        unit = 'px';
      }
      element.style[prop] = styles[prop] + unit;
    });
  }

  /**
   * Set the attributes to the given popper
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element - Element to apply the attributes to
   * @argument {Object} styles
   * Object with a list of properties and values which will be applied to the element
   */
  function setAttributes(element, attributes) {
    Object.keys(attributes).forEach(function (prop) {
      var value = attributes[prop];
      if (value !== false) {
        element.setAttribute(prop, attributes[prop]);
      } else {
        element.removeAttribute(prop);
      }
    });
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} data.styles - List of style properties - values to apply to popper element
   * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The same data object
   */
  function applyStyle(data) {
    // any property present in `data.styles` will be applied to the popper,
    // in this way we can make the 3rd party modifiers add custom styles to it
    // Be aware, modifiers could override the properties defined in the previous
    // lines of this modifier!
    setStyles(data.instance.popper, data.styles);

    // any property present in `data.attributes` will be applied to the popper,
    // they will be set as HTML attributes of the element
    setAttributes(data.instance.popper, data.attributes);

    // if arrowElement is defined and arrowStyles has some properties
    if (data.arrowElement && Object.keys(data.arrowStyles).length) {
      setStyles(data.arrowElement, data.arrowStyles);
    }

    return data;
  }

  /**
   * Set the x-placement attribute before everything else because it could be used
   * to add margins to the popper margins needs to be calculated to get the
   * correct popper offsets.
   * @method
   * @memberof Popper.modifiers
   * @param {HTMLElement} reference - The reference element used to position the popper
   * @param {HTMLElement} popper - The HTML element used as popper
   * @param {Object} options - Popper.js options
   */
  function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
    // compute reference element offsets
    var referenceOffsets = getReferenceOffsets(state, popper, reference, options.positionFixed);

    // compute auto placement, store placement inside the data object,
    // modifiers will be able to edit `placement` if needed
    // and refer to originalPlacement to know the original value
    var placement = computeAutoPlacement(options.placement, referenceOffsets, popper, reference, options.modifiers.flip.boundariesElement, options.modifiers.flip.padding);

    popper.setAttribute('x-placement', placement);

    // Apply `position` to popper before anything else because
    // without the position applied we can't guarantee correct computations
    setStyles(popper, { position: options.positionFixed ? 'fixed' : 'absolute' });

    return options;
  }

  /**
   * @function
   * @memberof Popper.Utils
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Boolean} shouldRound - If the offsets should be rounded at all
   * @returns {Object} The popper's position offsets rounded
   *
   * The tale of pixel-perfect positioning. It's still not 100% perfect, but as
   * good as it can be within reason.
   * Discussion here: https://github.com/FezVrasta/popper.js/pull/715
   *
   * Low DPI screens cause a popper to be blurry if not using full pixels (Safari
   * as well on High DPI screens).
   *
   * Firefox prefers no rounding for positioning and does not have blurriness on
   * high DPI screens.
   *
   * Only horizontal placement and left/right values need to be considered.
   */
  function getRoundedOffsets(data, shouldRound) {
    var _data$offsets = data.offsets,
        popper = _data$offsets.popper,
        reference = _data$offsets.reference;
    var round = Math.round,
        floor = Math.floor;

    var noRound = function noRound(v) {
      return v;
    };

    var referenceWidth = round(reference.width);
    var popperWidth = round(popper.width);

    var isVertical = ['left', 'right'].indexOf(data.placement) !== -1;
    var isVariation = data.placement.indexOf('-') !== -1;
    var sameWidthParity = referenceWidth % 2 === popperWidth % 2;
    var bothOddWidth = referenceWidth % 2 === 1 && popperWidth % 2 === 1;

    var horizontalToInteger = !shouldRound ? noRound : isVertical || isVariation || sameWidthParity ? round : floor;
    var verticalToInteger = !shouldRound ? noRound : round;

    return {
      left: horizontalToInteger(bothOddWidth && !isVariation && shouldRound ? popper.left - 1 : popper.left),
      top: verticalToInteger(popper.top),
      bottom: verticalToInteger(popper.bottom),
      right: horizontalToInteger(popper.right)
    };
  }

  var isFirefox = isBrowser$1 && /Firefox/i.test(navigator.userAgent);

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function computeStyle(data, options) {
    var x = options.x,
        y = options.y;
    var popper = data.offsets.popper;

    // Remove this legacy support in Popper.js v2

    var legacyGpuAccelerationOption = find(data.instance.modifiers, function (modifier) {
      return modifier.name === 'applyStyle';
    }).gpuAcceleration;
    if (legacyGpuAccelerationOption !== undefined) {
      console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
    }
    var gpuAcceleration = legacyGpuAccelerationOption !== undefined ? legacyGpuAccelerationOption : options.gpuAcceleration;

    var offsetParent = getOffsetParent(data.instance.popper);
    var offsetParentRect = getBoundingClientRect(offsetParent);

    // Styles
    var styles = {
      position: popper.position
    };

    var offsets = getRoundedOffsets(data, window.devicePixelRatio < 2 || !isFirefox);

    var sideA = x === 'bottom' ? 'top' : 'bottom';
    var sideB = y === 'right' ? 'left' : 'right';

    // if gpuAcceleration is set to `true` and transform is supported,
    //  we use `translate3d` to apply the position to the popper we
    // automatically use the supported prefixed version if needed
    var prefixedProperty = getSupportedPropertyName('transform');

    // now, let's make a step back and look at this code closely (wtf?)
    // If the content of the popper grows once it's been positioned, it
    // may happen that the popper gets misplaced because of the new content
    // overflowing its reference element
    // To avoid this problem, we provide two options (x and y), which allow
    // the consumer to define the offset origin.
    // If we position a popper on top of a reference element, we can set
    // `x` to `top` to make the popper grow towards its top instead of
    // its bottom.
    var left = void 0,
        top = void 0;
    if (sideA === 'bottom') {
      // when offsetParent is <html> the positioning is relative to the bottom of the screen (excluding the scrollbar)
      // and not the bottom of the html element
      if (offsetParent.nodeName === 'HTML') {
        top = -offsetParent.clientHeight + offsets.bottom;
      } else {
        top = -offsetParentRect.height + offsets.bottom;
      }
    } else {
      top = offsets.top;
    }
    if (sideB === 'right') {
      if (offsetParent.nodeName === 'HTML') {
        left = -offsetParent.clientWidth + offsets.right;
      } else {
        left = -offsetParentRect.width + offsets.right;
      }
    } else {
      left = offsets.left;
    }
    if (gpuAcceleration && prefixedProperty) {
      styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
      styles[sideA] = 0;
      styles[sideB] = 0;
      styles.willChange = 'transform';
    } else {
      // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
      var invertTop = sideA === 'bottom' ? -1 : 1;
      var invertLeft = sideB === 'right' ? -1 : 1;
      styles[sideA] = top * invertTop;
      styles[sideB] = left * invertLeft;
      styles.willChange = sideA + ', ' + sideB;
    }

    // Attributes
    var attributes = {
      'x-placement': data.placement
    };

    // Update `data` attributes, styles and arrowStyles
    data.attributes = _extends({}, attributes, data.attributes);
    data.styles = _extends({}, styles, data.styles);
    data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);

    return data;
  }

  /**
   * Helper used to know if the given modifier depends from another one.<br />
   * It checks if the needed modifier is listed and enabled.
   * @method
   * @memberof Popper.Utils
   * @param {Array} modifiers - list of modifiers
   * @param {String} requestingName - name of requesting modifier
   * @param {String} requestedName - name of requested modifier
   * @returns {Boolean}
   */
  function isModifierRequired(modifiers, requestingName, requestedName) {
    var requesting = find(modifiers, function (_ref) {
      var name = _ref.name;
      return name === requestingName;
    });

    var isRequired = !!requesting && modifiers.some(function (modifier) {
      return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
    });

    if (!isRequired) {
      var _requesting = '`' + requestingName + '`';
      var requested = '`' + requestedName + '`';
      console.warn(requested + ' modifier is required by ' + _requesting + ' modifier in order to work, be sure to include it before ' + _requesting + '!');
    }
    return isRequired;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function arrow(data, options) {
    var _data$offsets$arrow;

    // arrow depends on keepTogether in order to work
    if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
      return data;
    }

    var arrowElement = options.element;

    // if arrowElement is a string, suppose it's a CSS selector
    if (typeof arrowElement === 'string') {
      arrowElement = data.instance.popper.querySelector(arrowElement);

      // if arrowElement is not found, don't run the modifier
      if (!arrowElement) {
        return data;
      }
    } else {
      // if the arrowElement isn't a query selector we must check that the
      // provided DOM node is child of its popper node
      if (!data.instance.popper.contains(arrowElement)) {
        console.warn('WARNING: `arrow.element` must be child of its popper element!');
        return data;
      }
    }

    var placement = data.placement.split('-')[0];
    var _data$offsets = data.offsets,
        popper = _data$offsets.popper,
        reference = _data$offsets.reference;

    var isVertical = ['left', 'right'].indexOf(placement) !== -1;

    var len = isVertical ? 'height' : 'width';
    var sideCapitalized = isVertical ? 'Top' : 'Left';
    var side = sideCapitalized.toLowerCase();
    var altSide = isVertical ? 'left' : 'top';
    var opSide = isVertical ? 'bottom' : 'right';
    var arrowElementSize = getOuterSizes(arrowElement)[len];

    //
    // extends keepTogether behavior making sure the popper and its
    // reference have enough pixels in conjunction
    //

    // top/left side
    if (reference[opSide] - arrowElementSize < popper[side]) {
      data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowElementSize);
    }
    // bottom/right side
    if (reference[side] + arrowElementSize > popper[opSide]) {
      data.offsets.popper[side] += reference[side] + arrowElementSize - popper[opSide];
    }
    data.offsets.popper = getClientRect(data.offsets.popper);

    // compute center of the popper
    var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;

    // Compute the sideValue using the updated popper offsets
    // take popper margin in account because we don't have this info available
    var css = getStyleComputedProperty(data.instance.popper);
    var popperMarginSide = parseFloat(css['margin' + sideCapitalized], 10);
    var popperBorderSide = parseFloat(css['border' + sideCapitalized + 'Width'], 10);
    var sideValue = center - data.offsets.popper[side] - popperMarginSide - popperBorderSide;

    // prevent arrowElement from being placed not contiguously to its popper
    sideValue = Math.max(Math.min(popper[len] - arrowElementSize, sideValue), 0);

    data.arrowElement = arrowElement;
    data.offsets.arrow = (_data$offsets$arrow = {}, defineProperty$1(_data$offsets$arrow, side, Math.round(sideValue)), defineProperty$1(_data$offsets$arrow, altSide, ''), _data$offsets$arrow);

    return data;
  }

  /**
   * Get the opposite placement variation of the given one
   * @method
   * @memberof Popper.Utils
   * @argument {String} placement variation
   * @returns {String} flipped placement variation
   */
  function getOppositeVariation(variation) {
    if (variation === 'end') {
      return 'start';
    } else if (variation === 'start') {
      return 'end';
    }
    return variation;
  }

  /**
   * List of accepted placements to use as values of the `placement` option.<br />
   * Valid placements are:
   * - `auto`
   * - `top`
   * - `right`
   * - `bottom`
   * - `left`
   *
   * Each placement can have a variation from this list:
   * - `-start`
   * - `-end`
   *
   * Variations are interpreted easily if you think of them as the left to right
   * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
   * is right.<br />
   * Vertically (`left` and `right`), `start` is top and `end` is bottom.
   *
   * Some valid examples are:
   * - `top-end` (on top of reference, right aligned)
   * - `right-start` (on right of reference, top aligned)
   * - `bottom` (on bottom, centered)
   * - `auto-end` (on the side with more space available, alignment depends by placement)
   *
   * @static
   * @type {Array}
   * @enum {String}
   * @readonly
   * @method placements
   * @memberof Popper
   */
  var placements = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];

  // Get rid of `auto` `auto-start` and `auto-end`
  var validPlacements = placements.slice(3);

  /**
   * Given an initial placement, returns all the subsequent placements
   * clockwise (or counter-clockwise).
   *
   * @method
   * @memberof Popper.Utils
   * @argument {String} placement - A valid placement (it accepts variations)
   * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
   * @returns {Array} placements including their variations
   */
  function clockwise(placement) {
    var counter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var index = validPlacements.indexOf(placement);
    var arr = validPlacements.slice(index + 1).concat(validPlacements.slice(0, index));
    return counter ? arr.reverse() : arr;
  }

  var BEHAVIORS = {
    FLIP: 'flip',
    CLOCKWISE: 'clockwise',
    COUNTERCLOCKWISE: 'counterclockwise'
  };

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function flip(data, options) {
    // if `inner` modifier is enabled, we can't use the `flip` modifier
    if (isModifierEnabled(data.instance.modifiers, 'inner')) {
      return data;
    }

    if (data.flipped && data.placement === data.originalPlacement) {
      // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
      return data;
    }

    var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement, data.positionFixed);

    var placement = data.placement.split('-')[0];
    var placementOpposite = getOppositePlacement(placement);
    var variation = data.placement.split('-')[1] || '';

    var flipOrder = [];

    switch (options.behavior) {
      case BEHAVIORS.FLIP:
        flipOrder = [placement, placementOpposite];
        break;
      case BEHAVIORS.CLOCKWISE:
        flipOrder = clockwise(placement);
        break;
      case BEHAVIORS.COUNTERCLOCKWISE:
        flipOrder = clockwise(placement, true);
        break;
      default:
        flipOrder = options.behavior;
    }

    flipOrder.forEach(function (step, index) {
      if (placement !== step || flipOrder.length === index + 1) {
        return data;
      }

      placement = data.placement.split('-')[0];
      placementOpposite = getOppositePlacement(placement);

      var popperOffsets = data.offsets.popper;
      var refOffsets = data.offsets.reference;

      // using floor because the reference offsets may contain decimals we are not going to consider here
      var floor = Math.floor;
      var overlapsRef = placement === 'left' && floor(popperOffsets.right) > floor(refOffsets.left) || placement === 'right' && floor(popperOffsets.left) < floor(refOffsets.right) || placement === 'top' && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === 'bottom' && floor(popperOffsets.top) < floor(refOffsets.bottom);

      var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
      var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
      var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
      var overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);

      var overflowsBoundaries = placement === 'left' && overflowsLeft || placement === 'right' && overflowsRight || placement === 'top' && overflowsTop || placement === 'bottom' && overflowsBottom;

      // flip the variation if required
      var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;

      // flips variation if reference element overflows boundaries
      var flippedVariationByRef = !!options.flipVariations && (isVertical && variation === 'start' && overflowsLeft || isVertical && variation === 'end' && overflowsRight || !isVertical && variation === 'start' && overflowsTop || !isVertical && variation === 'end' && overflowsBottom);

      // flips variation if popper content overflows boundaries
      var flippedVariationByContent = !!options.flipVariationsByContent && (isVertical && variation === 'start' && overflowsRight || isVertical && variation === 'end' && overflowsLeft || !isVertical && variation === 'start' && overflowsBottom || !isVertical && variation === 'end' && overflowsTop);

      var flippedVariation = flippedVariationByRef || flippedVariationByContent;

      if (overlapsRef || overflowsBoundaries || flippedVariation) {
        // this boolean to detect any flip loop
        data.flipped = true;

        if (overlapsRef || overflowsBoundaries) {
          placement = flipOrder[index + 1];
        }

        if (flippedVariation) {
          variation = getOppositeVariation(variation);
        }

        data.placement = placement + (variation ? '-' + variation : '');

        // this object contains `position`, we want to preserve it along with
        // any additional property we may add in the future
        data.offsets.popper = _extends({}, data.offsets.popper, getPopperOffsets(data.instance.popper, data.offsets.reference, data.placement));

        data = runModifiers(data.instance.modifiers, data, 'flip');
      }
    });
    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function keepTogether(data) {
    var _data$offsets = data.offsets,
        popper = _data$offsets.popper,
        reference = _data$offsets.reference;

    var placement = data.placement.split('-')[0];
    var floor = Math.floor;
    var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
    var side = isVertical ? 'right' : 'bottom';
    var opSide = isVertical ? 'left' : 'top';
    var measurement = isVertical ? 'width' : 'height';

    if (popper[side] < floor(reference[opSide])) {
      data.offsets.popper[opSide] = floor(reference[opSide]) - popper[measurement];
    }
    if (popper[opSide] > floor(reference[side])) {
      data.offsets.popper[opSide] = floor(reference[side]);
    }

    return data;
  }

  /**
   * Converts a string containing value + unit into a px value number
   * @function
   * @memberof {modifiers~offset}
   * @private
   * @argument {String} str - Value + unit string
   * @argument {String} measurement - `height` or `width`
   * @argument {Object} popperOffsets
   * @argument {Object} referenceOffsets
   * @returns {Number|String}
   * Value in pixels, or original string if no values were extracted
   */
  function toValue(str, measurement, popperOffsets, referenceOffsets) {
    // separate value from unit
    var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
    var value = +split[1];
    var unit = split[2];

    // If it's not a number it's an operator, I guess
    if (!value) {
      return str;
    }

    if (unit.indexOf('%') === 0) {
      var element = void 0;
      switch (unit) {
        case '%p':
          element = popperOffsets;
          break;
        case '%':
        case '%r':
        default:
          element = referenceOffsets;
      }

      var rect = getClientRect(element);
      return rect[measurement] / 100 * value;
    } else if (unit === 'vh' || unit === 'vw') {
      // if is a vh or vw, we calculate the size based on the viewport
      var size = void 0;
      if (unit === 'vh') {
        size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      } else {
        size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      }
      return size / 100 * value;
    } else {
      // if is an explicit pixel unit, we get rid of the unit and keep the value
      // if is an implicit unit, it's px, and we return just the value
      return value;
    }
  }

  /**
   * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
   * @function
   * @memberof {modifiers~offset}
   * @private
   * @argument {String} offset
   * @argument {Object} popperOffsets
   * @argument {Object} referenceOffsets
   * @argument {String} basePlacement
   * @returns {Array} a two cells array with x and y offsets in numbers
   */
  function parseOffset(offset, popperOffsets, referenceOffsets, basePlacement) {
    var offsets = [0, 0];

    // Use height if placement is left or right and index is 0 otherwise use width
    // in this way the first offset will use an axis and the second one
    // will use the other one
    var useHeight = ['right', 'left'].indexOf(basePlacement) !== -1;

    // Split the offset string to obtain a list of values and operands
    // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
    var fragments = offset.split(/(\+|\-)/).map(function (frag) {
      return frag.trim();
    });

    // Detect if the offset string contains a pair of values or a single one
    // they could be separated by comma or space
    var divider = fragments.indexOf(find(fragments, function (frag) {
      return frag.search(/,|\s/) !== -1;
    }));

    if (fragments[divider] && fragments[divider].indexOf(',') === -1) {
      console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
    }

    // If divider is found, we divide the list of values and operands to divide
    // them by ofset X and Y.
    var splitRegex = /\s*,\s*|\s+/;
    var ops = divider !== -1 ? [fragments.slice(0, divider).concat([fragments[divider].split(splitRegex)[0]]), [fragments[divider].split(splitRegex)[1]].concat(fragments.slice(divider + 1))] : [fragments];

    // Convert the values with units to absolute pixels to allow our computations
    ops = ops.map(function (op, index) {
      // Most of the units rely on the orientation of the popper
      var measurement = (index === 1 ? !useHeight : useHeight) ? 'height' : 'width';
      var mergeWithPrevious = false;
      return op
      // This aggregates any `+` or `-` sign that aren't considered operators
      // e.g.: 10 + +5 => [10, +, +5]
      .reduce(function (a, b) {
        if (a[a.length - 1] === '' && ['+', '-'].indexOf(b) !== -1) {
          a[a.length - 1] = b;
          mergeWithPrevious = true;
          return a;
        } else if (mergeWithPrevious) {
          a[a.length - 1] += b;
          mergeWithPrevious = false;
          return a;
        } else {
          return a.concat(b);
        }
      }, [])
      // Here we convert the string values into number values (in px)
      .map(function (str) {
        return toValue(str, measurement, popperOffsets, referenceOffsets);
      });
    });

    // Loop trough the offsets arrays and execute the operations
    ops.forEach(function (op, index) {
      op.forEach(function (frag, index2) {
        if (isNumeric(frag)) {
          offsets[index] += frag * (op[index2 - 1] === '-' ? -1 : 1);
        }
      });
    });
    return offsets;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @argument {Number|String} options.offset=0
   * The offset value as described in the modifier description
   * @returns {Object} The data object, properly modified
   */
  function offset$1(data, _ref) {
    var offset = _ref.offset;
    var placement = data.placement,
        _data$offsets = data.offsets,
        popper = _data$offsets.popper,
        reference = _data$offsets.reference;

    var basePlacement = placement.split('-')[0];

    var offsets = void 0;
    if (isNumeric(+offset)) {
      offsets = [+offset, 0];
    } else {
      offsets = parseOffset(offset, popper, reference, basePlacement);
    }

    if (basePlacement === 'left') {
      popper.top += offsets[0];
      popper.left -= offsets[1];
    } else if (basePlacement === 'right') {
      popper.top += offsets[0];
      popper.left += offsets[1];
    } else if (basePlacement === 'top') {
      popper.left += offsets[0];
      popper.top -= offsets[1];
    } else if (basePlacement === 'bottom') {
      popper.left += offsets[0];
      popper.top += offsets[1];
    }

    data.popper = popper;
    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function preventOverflow(data, options) {
    var boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);

    // If offsetParent is the reference element, we really want to
    // go one step up and use the next offsetParent as reference to
    // avoid to make this modifier completely useless and look like broken
    if (data.instance.reference === boundariesElement) {
      boundariesElement = getOffsetParent(boundariesElement);
    }

    // NOTE: DOM access here
    // resets the popper's position so that the document size can be calculated excluding
    // the size of the popper element itself
    var transformProp = getSupportedPropertyName('transform');
    var popperStyles = data.instance.popper.style; // assignment to help minification
    var top = popperStyles.top,
        left = popperStyles.left,
        transform = popperStyles[transformProp];

    popperStyles.top = '';
    popperStyles.left = '';
    popperStyles[transformProp] = '';

    var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement, data.positionFixed);

    // NOTE: DOM access here
    // restores the original style properties after the offsets have been computed
    popperStyles.top = top;
    popperStyles.left = left;
    popperStyles[transformProp] = transform;

    options.boundaries = boundaries;

    var order = options.priority;
    var popper = data.offsets.popper;

    var check = {
      primary: function primary(placement) {
        var value = popper[placement];
        if (popper[placement] < boundaries[placement] && !options.escapeWithReference) {
          value = Math.max(popper[placement], boundaries[placement]);
        }
        return defineProperty$1({}, placement, value);
      },
      secondary: function secondary(placement) {
        var mainSide = placement === 'right' ? 'left' : 'top';
        var value = popper[mainSide];
        if (popper[placement] > boundaries[placement] && !options.escapeWithReference) {
          value = Math.min(popper[mainSide], boundaries[placement] - (placement === 'right' ? popper.width : popper.height));
        }
        return defineProperty$1({}, mainSide, value);
      }
    };

    order.forEach(function (placement) {
      var side = ['left', 'top'].indexOf(placement) !== -1 ? 'primary' : 'secondary';
      popper = _extends({}, popper, check[side](placement));
    });

    data.offsets.popper = popper;

    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function shift(data) {
    var placement = data.placement;
    var basePlacement = placement.split('-')[0];
    var shiftvariation = placement.split('-')[1];

    // if shift shiftvariation is specified, run the modifier
    if (shiftvariation) {
      var _data$offsets = data.offsets,
          reference = _data$offsets.reference,
          popper = _data$offsets.popper;

      var isVertical = ['bottom', 'top'].indexOf(basePlacement) !== -1;
      var side = isVertical ? 'left' : 'top';
      var measurement = isVertical ? 'width' : 'height';

      var shiftOffsets = {
        start: defineProperty$1({}, side, reference[side]),
        end: defineProperty$1({}, side, reference[side] + reference[measurement] - popper[measurement])
      };

      data.offsets.popper = _extends({}, popper, shiftOffsets[shiftvariation]);
    }

    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function hide(data) {
    if (!isModifierRequired(data.instance.modifiers, 'hide', 'preventOverflow')) {
      return data;
    }

    var refRect = data.offsets.reference;
    var bound = find(data.instance.modifiers, function (modifier) {
      return modifier.name === 'preventOverflow';
    }).boundaries;

    if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
      // Avoid unnecessary DOM access if visibility hasn't changed
      if (data.hide === true) {
        return data;
      }

      data.hide = true;
      data.attributes['x-out-of-boundaries'] = '';
    } else {
      // Avoid unnecessary DOM access if visibility hasn't changed
      if (data.hide === false) {
        return data;
      }

      data.hide = false;
      data.attributes['x-out-of-boundaries'] = false;
    }

    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function inner(data) {
    var placement = data.placement;
    var basePlacement = placement.split('-')[0];
    var _data$offsets = data.offsets,
        popper = _data$offsets.popper,
        reference = _data$offsets.reference;

    var isHoriz = ['left', 'right'].indexOf(basePlacement) !== -1;

    var subtractLength = ['top', 'left'].indexOf(basePlacement) === -1;

    popper[isHoriz ? 'left' : 'top'] = reference[basePlacement] - (subtractLength ? popper[isHoriz ? 'width' : 'height'] : 0);

    data.placement = getOppositePlacement(placement);
    data.offsets.popper = getClientRect(popper);

    return data;
  }

  /**
   * Modifier function, each modifier can have a function of this type assigned
   * to its `fn` property.<br />
   * These functions will be called on each update, this means that you must
   * make sure they are performant enough to avoid performance bottlenecks.
   *
   * @function ModifierFn
   * @argument {dataObject} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {dataObject} The data object, properly modified
   */

  /**
   * Modifiers are plugins used to alter the behavior of your poppers.<br />
   * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
   * needed by the library.
   *
   * Usually you don't want to override the `order`, `fn` and `onLoad` props.
   * All the other properties are configurations that could be tweaked.
   * @namespace modifiers
   */
  var modifiers = {
    /**
     * Modifier used to shift the popper on the start or end of its reference
     * element.<br />
     * It will read the variation of the `placement` property.<br />
     * It can be one either `-end` or `-start`.
     * @memberof modifiers
     * @inner
     */
    shift: {
      /** @prop {number} order=100 - Index used to define the order of execution */
      order: 100,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: shift
    },

    /**
     * The `offset` modifier can shift your popper on both its axis.
     *
     * It accepts the following units:
     * - `px` or unit-less, interpreted as pixels
     * - `%` or `%r`, percentage relative to the length of the reference element
     * - `%p`, percentage relative to the length of the popper element
     * - `vw`, CSS viewport width unit
     * - `vh`, CSS viewport height unit
     *
     * For length is intended the main axis relative to the placement of the popper.<br />
     * This means that if the placement is `top` or `bottom`, the length will be the
     * `width`. In case of `left` or `right`, it will be the `height`.
     *
     * You can provide a single value (as `Number` or `String`), or a pair of values
     * as `String` divided by a comma or one (or more) white spaces.<br />
     * The latter is a deprecated method because it leads to confusion and will be
     * removed in v2.<br />
     * Additionally, it accepts additions and subtractions between different units.
     * Note that multiplications and divisions aren't supported.
     *
     * Valid examples are:
     * ```
     * 10
     * '10%'
     * '10, 10'
     * '10%, 10'
     * '10 + 10%'
     * '10 - 5vh + 3%'
     * '-10px + 5vh, 5px - 6%'
     * ```
     * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
     * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
     * > You can read more on this at this [issue](https://github.com/FezVrasta/popper.js/issues/373).
     *
     * @memberof modifiers
     * @inner
     */
    offset: {
      /** @prop {number} order=200 - Index used to define the order of execution */
      order: 200,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: offset$1,
      /** @prop {Number|String} offset=0
       * The offset value as described in the modifier description
       */
      offset: 0
    },

    /**
     * Modifier used to prevent the popper from being positioned outside the boundary.
     *
     * A scenario exists where the reference itself is not within the boundaries.<br />
     * We can say it has "escaped the boundaries" — or just "escaped".<br />
     * In this case we need to decide whether the popper should either:
     *
     * - detach from the reference and remain "trapped" in the boundaries, or
     * - if it should ignore the boundary and "escape with its reference"
     *
     * When `escapeWithReference` is set to`true` and reference is completely
     * outside its boundaries, the popper will overflow (or completely leave)
     * the boundaries in order to remain attached to the edge of the reference.
     *
     * @memberof modifiers
     * @inner
     */
    preventOverflow: {
      /** @prop {number} order=300 - Index used to define the order of execution */
      order: 300,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: preventOverflow,
      /**
       * @prop {Array} [priority=['left','right','top','bottom']]
       * Popper will try to prevent overflow following these priorities by default,
       * then, it could overflow on the left and on top of the `boundariesElement`
       */
      priority: ['left', 'right', 'top', 'bottom'],
      /**
       * @prop {number} padding=5
       * Amount of pixel used to define a minimum distance between the boundaries
       * and the popper. This makes sure the popper always has a little padding
       * between the edges of its container
       */
      padding: 5,
      /**
       * @prop {String|HTMLElement} boundariesElement='scrollParent'
       * Boundaries used by the modifier. Can be `scrollParent`, `window`,
       * `viewport` or any DOM element.
       */
      boundariesElement: 'scrollParent'
    },

    /**
     * Modifier used to make sure the reference and its popper stay near each other
     * without leaving any gap between the two. Especially useful when the arrow is
     * enabled and you want to ensure that it points to its reference element.
     * It cares only about the first axis. You can still have poppers with margin
     * between the popper and its reference element.
     * @memberof modifiers
     * @inner
     */
    keepTogether: {
      /** @prop {number} order=400 - Index used to define the order of execution */
      order: 400,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: keepTogether
    },

    /**
     * This modifier is used to move the `arrowElement` of the popper to make
     * sure it is positioned between the reference element and its popper element.
     * It will read the outer size of the `arrowElement` node to detect how many
     * pixels of conjunction are needed.
     *
     * It has no effect if no `arrowElement` is provided.
     * @memberof modifiers
     * @inner
     */
    arrow: {
      /** @prop {number} order=500 - Index used to define the order of execution */
      order: 500,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: arrow,
      /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
      element: '[x-arrow]'
    },

    /**
     * Modifier used to flip the popper's placement when it starts to overlap its
     * reference element.
     *
     * Requires the `preventOverflow` modifier before it in order to work.
     *
     * **NOTE:** this modifier will interrupt the current update cycle and will
     * restart it if it detects the need to flip the placement.
     * @memberof modifiers
     * @inner
     */
    flip: {
      /** @prop {number} order=600 - Index used to define the order of execution */
      order: 600,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: flip,
      /**
       * @prop {String|Array} behavior='flip'
       * The behavior used to change the popper's placement. It can be one of
       * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
       * placements (with optional variations)
       */
      behavior: 'flip',
      /**
       * @prop {number} padding=5
       * The popper will flip if it hits the edges of the `boundariesElement`
       */
      padding: 5,
      /**
       * @prop {String|HTMLElement} boundariesElement='viewport'
       * The element which will define the boundaries of the popper position.
       * The popper will never be placed outside of the defined boundaries
       * (except if `keepTogether` is enabled)
       */
      boundariesElement: 'viewport',
      /**
       * @prop {Boolean} flipVariations=false
       * The popper will switch placement variation between `-start` and `-end` when
       * the reference element overlaps its boundaries.
       *
       * The original placement should have a set variation.
       */
      flipVariations: false,
      /**
       * @prop {Boolean} flipVariationsByContent=false
       * The popper will switch placement variation between `-start` and `-end` when
       * the popper element overlaps its reference boundaries.
       *
       * The original placement should have a set variation.
       */
      flipVariationsByContent: false
    },

    /**
     * Modifier used to make the popper flow toward the inner of the reference element.
     * By default, when this modifier is disabled, the popper will be placed outside
     * the reference element.
     * @memberof modifiers
     * @inner
     */
    inner: {
      /** @prop {number} order=700 - Index used to define the order of execution */
      order: 700,
      /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
      enabled: false,
      /** @prop {ModifierFn} */
      fn: inner
    },

    /**
     * Modifier used to hide the popper when its reference element is outside of the
     * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
     * be used to hide with a CSS selector the popper when its reference is
     * out of boundaries.
     *
     * Requires the `preventOverflow` modifier before it in order to work.
     * @memberof modifiers
     * @inner
     */
    hide: {
      /** @prop {number} order=800 - Index used to define the order of execution */
      order: 800,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: hide
    },

    /**
     * Computes the style that will be applied to the popper element to gets
     * properly positioned.
     *
     * Note that this modifier will not touch the DOM, it just prepares the styles
     * so that `applyStyle` modifier can apply it. This separation is useful
     * in case you need to replace `applyStyle` with a custom implementation.
     *
     * This modifier has `850` as `order` value to maintain backward compatibility
     * with previous versions of Popper.js. Expect the modifiers ordering method
     * to change in future major versions of the library.
     *
     * @memberof modifiers
     * @inner
     */
    computeStyle: {
      /** @prop {number} order=850 - Index used to define the order of execution */
      order: 850,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: computeStyle,
      /**
       * @prop {Boolean} gpuAcceleration=true
       * If true, it uses the CSS 3D transformation to position the popper.
       * Otherwise, it will use the `top` and `left` properties
       */
      gpuAcceleration: true,
      /**
       * @prop {string} [x='bottom']
       * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
       * Change this if your popper should grow in a direction different from `bottom`
       */
      x: 'bottom',
      /**
       * @prop {string} [x='left']
       * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
       * Change this if your popper should grow in a direction different from `right`
       */
      y: 'right'
    },

    /**
     * Applies the computed styles to the popper element.
     *
     * All the DOM manipulations are limited to this modifier. This is useful in case
     * you want to integrate Popper.js inside a framework or view library and you
     * want to delegate all the DOM manipulations to it.
     *
     * Note that if you disable this modifier, you must make sure the popper element
     * has its position set to `absolute` before Popper.js can do its work!
     *
     * Just disable this modifier and define your own to achieve the desired effect.
     *
     * @memberof modifiers
     * @inner
     */
    applyStyle: {
      /** @prop {number} order=900 - Index used to define the order of execution */
      order: 900,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: applyStyle,
      /** @prop {Function} */
      onLoad: applyStyleOnLoad,
      /**
       * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
       * @prop {Boolean} gpuAcceleration=true
       * If true, it uses the CSS 3D transformation to position the popper.
       * Otherwise, it will use the `top` and `left` properties
       */
      gpuAcceleration: undefined
    }
  };

  /**
   * The `dataObject` is an object containing all the information used by Popper.js.
   * This object is passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
   * @name dataObject
   * @property {Object} data.instance The Popper.js instance
   * @property {String} data.placement Placement applied to popper
   * @property {String} data.originalPlacement Placement originally defined on init
   * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
   * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper
   * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
   * @property {Object} data.styles Any CSS property defined here will be applied to the popper. It expects the JavaScript nomenclature (eg. `marginBottom`)
   * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow. It expects the JavaScript nomenclature (eg. `marginBottom`)
   * @property {Object} data.boundaries Offsets of the popper boundaries
   * @property {Object} data.offsets The measurements of popper, reference and arrow elements
   * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
   * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
   * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
   */

  /**
   * Default options provided to Popper.js constructor.<br />
   * These can be overridden using the `options` argument of Popper.js.<br />
   * To override an option, simply pass an object with the same
   * structure of the `options` object, as the 3rd argument. For example:
   * ```
   * new Popper(ref, pop, {
   *   modifiers: {
   *     preventOverflow: { enabled: false }
   *   }
   * })
   * ```
   * @type {Object}
   * @static
   * @memberof Popper
   */
  var Defaults = {
    /**
     * Popper's placement.
     * @prop {Popper.placements} placement='bottom'
     */
    placement: 'bottom',

    /**
     * Set this to true if you want popper to position it self in 'fixed' mode
     * @prop {Boolean} positionFixed=false
     */
    positionFixed: false,

    /**
     * Whether events (resize, scroll) are initially enabled.
     * @prop {Boolean} eventsEnabled=true
     */
    eventsEnabled: true,

    /**
     * Set to true if you want to automatically remove the popper when
     * you call the `destroy` method.
     * @prop {Boolean} removeOnDestroy=false
     */
    removeOnDestroy: false,

    /**
     * Callback called when the popper is created.<br />
     * By default, it is set to no-op.<br />
     * Access Popper.js instance with `data.instance`.
     * @prop {onCreate}
     */
    onCreate: function onCreate() {},

    /**
     * Callback called when the popper is updated. This callback is not called
     * on the initialization/creation of the popper, but only on subsequent
     * updates.<br />
     * By default, it is set to no-op.<br />
     * Access Popper.js instance with `data.instance`.
     * @prop {onUpdate}
     */
    onUpdate: function onUpdate() {},

    /**
     * List of modifiers used to modify the offsets before they are applied to the popper.
     * They provide most of the functionalities of Popper.js.
     * @prop {modifiers}
     */
    modifiers: modifiers
  };

  /**
   * @callback onCreate
   * @param {dataObject} data
   */

  /**
   * @callback onUpdate
   * @param {dataObject} data
   */

  // Utils
  // Methods
  var Popper = function () {
    /**
     * Creates a new Popper.js instance.
     * @class Popper
     * @param {Element|referenceObject} reference - The reference element used to position the popper
     * @param {Element} popper - The HTML / XML element used as the popper
     * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
     * @return {Object} instance - The generated Popper.js instance
     */
    function Popper(reference, popper) {
      var _this = this;

      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      classCallCheck(this, Popper);

      this.scheduleUpdate = function () {
        return requestAnimationFrame(_this.update);
      };

      // make update() debounced, so that it only runs at most once-per-tick
      this.update = debounce(this.update.bind(this));

      // with {} we create a new object with the options inside it
      this.options = _extends({}, Popper.Defaults, options);

      // init state
      this.state = {
        isDestroyed: false,
        isCreated: false,
        scrollParents: []
      };

      // get reference and popper elements (allow jQuery wrappers)
      this.reference = reference && reference.jquery ? reference[0] : reference;
      this.popper = popper && popper.jquery ? popper[0] : popper;

      // Deep merge modifiers options
      this.options.modifiers = {};
      Object.keys(_extends({}, Popper.Defaults.modifiers, options.modifiers)).forEach(function (name) {
        _this.options.modifiers[name] = _extends({}, Popper.Defaults.modifiers[name] || {}, options.modifiers ? options.modifiers[name] : {});
      });

      // Refactoring modifiers' list (Object => Array)
      this.modifiers = Object.keys(this.options.modifiers).map(function (name) {
        return _extends({
          name: name
        }, _this.options.modifiers[name]);
      })
      // sort the modifiers by order
      .sort(function (a, b) {
        return a.order - b.order;
      });

      // modifiers have the ability to execute arbitrary code when Popper.js get inited
      // such code is executed in the same order of its modifier
      // they could add new properties to their options configuration
      // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
      this.modifiers.forEach(function (modifierOptions) {
        if (modifierOptions.enabled && isFunction$1(modifierOptions.onLoad)) {
          modifierOptions.onLoad(_this.reference, _this.popper, _this.options, modifierOptions, _this.state);
        }
      });

      // fire the first update to position the popper in the right place
      this.update();

      var eventsEnabled = this.options.eventsEnabled;
      if (eventsEnabled) {
        // setup event listeners, they will take care of update the position in specific situations
        this.enableEventListeners();
      }

      this.state.eventsEnabled = eventsEnabled;
    }

    // We can't use class properties because they don't get listed in the
    // class prototype and break stuff like Sinon stubs


    createClass(Popper, [{
      key: 'update',
      value: function update$$1() {
        return update.call(this);
      }
    }, {
      key: 'destroy',
      value: function destroy$$1() {
        return destroy.call(this);
      }
    }, {
      key: 'enableEventListeners',
      value: function enableEventListeners$$1() {
        return enableEventListeners.call(this);
      }
    }, {
      key: 'disableEventListeners',
      value: function disableEventListeners$$1() {
        return disableEventListeners.call(this);
      }

      /**
       * Schedules an update. It will run on the next UI update available.
       * @method scheduleUpdate
       * @memberof Popper
       */


      /**
       * Collection of utilities useful when writing custom modifiers.
       * Starting from version 1.7, this method is available only if you
       * include `popper-utils.js` before `popper.js`.
       *
       * **DEPRECATION**: This way to access PopperUtils is deprecated
       * and will be removed in v2! Use the PopperUtils module directly instead.
       * Due to the high instability of the methods contained in Utils, we can't
       * guarantee them to follow semver. Use them at your own risk!
       * @static
       * @private
       * @type {Object}
       * @deprecated since version 1.8
       * @member Utils
       * @memberof Popper
       */

    }]);
    return Popper;
  }();

  /**
   * The `referenceObject` is an object that provides an interface compatible with Popper.js
   * and lets you use it as replacement of a real DOM node.<br />
   * You can use this method to position a popper relatively to a set of coordinates
   * in case you don't have a DOM node to use as reference.
   *
   * ```
   * new Popper(referenceObject, popperNode);
   * ```
   *
   * NB: This feature isn't supported in Internet Explorer 10.
   * @name referenceObject
   * @property {Function} data.getBoundingClientRect
   * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
   * @property {number} data.clientWidth
   * An ES6 getter that will return the width of the virtual reference element.
   * @property {number} data.clientHeight
   * An ES6 getter that will return the height of the virtual reference element.
   */


  Popper.Utils = (typeof window !== 'undefined' ? window : global).PopperUtils;
  Popper.placements = placements;
  Popper.Defaults = Defaults;

  var BvEvent =
  /*#__PURE__*/
  function () {
    function BvEvent(type) {
      var eventInit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, BvEvent);

      // Start by emulating native Event constructor.
      if (!type) {
        /* istanbul ignore next */
        throw new TypeError("Failed to construct '".concat(this.constructor.name, "'. 1 argument required, ").concat(arguments.length, " given."));
      } // Assign defaults first, the eventInit,
      // and the type last so it can't be overwritten.


      assign$1(this, BvEvent.Defaults, this.constructor.Defaults, eventInit, {
        type: type
      }); // Freeze some props as readonly, but leave them enumerable.

      defineProperties(this, {
        type: readonlyDescriptor(),
        cancelable: readonlyDescriptor(),
        nativeEvent: readonlyDescriptor(),
        target: readonlyDescriptor(),
        relatedTarget: readonlyDescriptor(),
        vueTarget: readonlyDescriptor()
      }); // Create a private variable using closure scoping.

      var defaultPrevented = false; // Recreate preventDefault method. One way setter.

      this.preventDefault = function preventDefault() {
        if (this.cancelable) {
          defaultPrevented = true;
        }
      }; // Create 'defaultPrevented' publicly accessible prop
      // that can only be altered by the preventDefault method.


      defineProperty(this, 'defaultPrevented', {
        enumerable: true,
        get: function get() {
          return defaultPrevented;
        }
      });
    }

    _createClass(BvEvent, null, [{
      key: "Defaults",
      get: function get() {
        return {
          type: '',
          cancelable: true,
          nativeEvent: null,
          target: null,
          relatedTarget: null,
          vueTarget: null
        };
      }
    }]);

    return BvEvent;
  }(); // Named Exports

  var clickOutMixin = {
    data: function data() {
      return {
        listenForClickOut: false
      };
    },
    watch: {
      listenForClickOut: function listenForClickOut(newValue, oldValue) {
        if (newValue !== oldValue) {
          eventOff(this.clickOutElement, this.clickOutEventName, this._clickOutHandler, false);

          if (newValue) {
            eventOn(this.clickOutElement, this.clickOutEventName, this._clickOutHandler, false);
          }
        }
      }
    },
    beforeCreate: function beforeCreate() {
      // Declare non-reactive properties
      this.clickOutElement = null;
      this.clickOutEventName = null;
    },
    mounted: function mounted() {
      if (!this.clickOutElement) {
        this.clickOutElement = document;
      }

      if (!this.clickOutEventName) {
        this.clickOutEventName = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click';
      }

      if (this.listenForClickOut) {
        eventOn(this.clickOutElement, this.clickOutEventName, this._clickOutHandler, false);
      }
    },
    beforeDestroy: function beforeDestroy()
    /* istanbul ignore next */
    {
      eventOff(this.clickOutElement, this.clickOutEventName, this._clickOutHandler, false);
    },
    methods: {
      isClickOut: function isClickOut(evt) {
        return !contains(this.$el, evt.target);
      },
      _clickOutHandler: function _clickOutHandler(evt) {
        if (this.clickOutHandler && this.isClickOut(evt)) {
          this.clickOutHandler(evt);
        }
      }
    }
  };

  var focusInMixin = {
    data: function data() {
      return {
        listenForFocusIn: false
      };
    },
    watch: {
      listenForFocusIn: function listenForFocusIn(newValue, oldValue) {
        if (newValue !== oldValue) {
          eventOff(this.focusInElement, 'focusin', this._focusInHandler, false);

          if (newValue) {
            eventOn(this.focusInElement, 'focusin', this._focusInHandler, false);
          }
        }
      }
    },
    beforeCreate: function beforeCreate() {
      // Declare non-reactive properties
      this.focusInElement = null;
    },
    mounted: function mounted() {
      if (!this.focusInElement) {
        this.focusInElement = document;
      }

      if (this.listenForFocusIn) {
        eventOn(this.focusInElement, 'focusin', this._focusInHandler, false);
      }
    },
    beforeDestroy: function beforeDestroy()
    /* istanbul ignore next */
    {
      eventOff(this.focusInElement, 'focusin', this._focusInHandler, false);
    },
    methods: {
      _focusInHandler: function _focusInHandler(evt) {
        if (this.focusInHandler) {
          this.focusInHandler(evt);
        }
      }
    }
  };

  function filterVisible(els) {
    return (els || []).filter(isVisible);
  } // Dropdown item CSS selectors
  // TODO: .dropdown-form handling


  var Selector = {
    FORM_CHILD: '.dropdown form',
    NAVBAR_NAV: '.navbar-nav',
    ITEM_SELECTOR: '.dropdown-item:not(.disabled):not([disabled])' // Popper attachment positions

  };
  var AttachmentMap = {
    // Dropup left align
    TOP: 'top-start',
    // Dropup right align
    TOPEND: 'top-end',
    // Dropdown left align
    BOTTOM: 'bottom-start',
    // Dropdown right align
    BOTTOMEND: 'bottom-end',
    // Dropright left align
    RIGHT: 'right-start',
    // Dropright right align
    RIGHTEND: 'right-end',
    // Dropleft left align
    LEFT: 'left-start',
    // Dropleft right align
    LEFTEND: 'left-end' // @vue/component

  };
  var dropdownMixin = {
    mixins: [clickOutMixin, focusInMixin],
    provide: function provide() {
      return {
        bvDropdown: this
      };
    },
    props: {
      disabled: {
        type: Boolean,
        default: false
      },
      text: {
        // Button label
        type: String,
        default: ''
      },
      html: {
        // Button label
        type: String
      },
      dropup: {
        // place on top if possible
        type: Boolean,
        default: false
      },
      dropright: {
        // place right if possible
        type: Boolean,
        default: false
      },
      dropleft: {
        // place left if possible
        type: Boolean,
        default: false
      },
      right: {
        // Right align menu (default is left align)
        type: Boolean,
        default: false
      },
      offset: {
        // Number of pixels to offset menu, or a CSS unit value (i.e. 1px, 1rem, etc)
        type: [Number, String],
        default: 0
      },
      noFlip: {
        // Disable auto-flipping of menu from bottom<=>top
        type: Boolean,
        default: false
      },
      popperOpts: {
        // type: Object,
        default: function _default() {}
      }
    },
    data: function data() {
      return {
        visible: false,
        inNavbar: null,
        visibleChangePrevented: false
      };
    },
    computed: {
      toggler: function toggler() {
        var toggle = this.$refs.toggle;
        return toggle ? toggle.$el || toggle : null;
      },
      directionClass: function directionClass() {
        if (this.dropup) {
          return 'dropup';
        } else if (this.dropright) {
          return 'dropright';
        } else if (this.dropleft) {
          return 'dropleft';
        }

        return '';
      }
    },
    watch: {
      visible: function visible(newValue, oldValue) {
        if (this.visibleChangePrevented) {
          this.visibleChangePrevented = false;
          return;
        }

        if (newValue !== oldValue) {
          var evtName = newValue ? 'show' : 'hide';
          var bvEvt = new BvEvent(evtName, {
            cancelable: true,
            vueTarget: this,
            target: this.$refs.menu,
            relatedTarget: null
          });
          this.emitEvent(bvEvt);

          if (bvEvt.defaultPrevented) {
            // Reset value and exit if canceled
            this.visibleChangePrevented = true;
            this.visible = oldValue; // Just in case a child element triggereded this.hide(true)

            this.$off('hidden', this.focusToggler);
            return;
          }

          if (evtName === 'show') {
            this.showMenu();
          } else {
            this.hideMenu();
          }
        }
      },
      disabled: function disabled(newValue, oldValue) {
        if (newValue !== oldValue && newValue && this.visible) {
          // Hide dropdown if disabled changes to true
          this.visible = false;
        }
      }
    },
    created: function created() {
      // Create non-reactive property
      this._popper = null;
    },
    deactivated: function deactivated()
    /* istanbul ignore next: not easy to test */
    {
      // In case we are inside a `<keep-alive>`
      this.visible = false;
      this.whileOpenListen(false);
      this.removePopper();
    },
    beforeDestroy: function beforeDestroy() {
      this.visible = false;
      this.whileOpenListen(false);
      this.removePopper();
    },
    methods: {
      // Event emitter
      emitEvent: function emitEvent(bvEvt) {
        var type = bvEvt.type;
        this.$emit(type, bvEvt);
        this.$root.$emit("bv::dropdown::".concat(type), bvEvt);
      },
      showMenu: function showMenu() {
        var _this = this;

        if (this.disabled) {
          /* istanbul ignore next */
          return;
        } // Ensure other menus are closed


        this.$root.$emit('bv::dropdown::shown', this); // Are we in a navbar ?

        if (isNull(this.inNavbar) && this.isNav) {
          /* istanbul ignore next */
          this.inNavbar = Boolean(closest('.navbar', this.$el));
        } // Disable totally Popper.js for Dropdown in Navbar


        if (!this.inNavbar) {
          if (typeof Popper === 'undefined') {
            /* istanbul ignore next */
            warn('b-dropdown: Popper.js not found. Falling back to CSS positioning.');
          } else {
            // for dropup with alignment we use the parent element as popper container
            var element = this.dropup && this.right || this.split ? this.$el : this.$refs.toggle; // Make sure we have a reference to an element, not a component!

            element = element.$el || element; // Instantiate popper.js

            this.createPopper(element);
          }
        }

        this.whileOpenListen(true); // Wrap in nextTick to ensure menu is fully rendered/shown

        this.$nextTick(function () {
          // Focus on the menu container on show
          _this.focusMenu(); // Emit the shown event


          _this.$emit('shown');
        });
      },
      hideMenu: function hideMenu() {
        this.whileOpenListen(false);
        this.$root.$emit('bv::dropdown::hidden', this);
        this.$emit('hidden');
        this.removePopper();
      },
      createPopper: function createPopper(element) {
        this.removePopper();
        this._popper = new Popper(element, this.$refs.menu, this.getPopperConfig());
      },
      removePopper: function removePopper() {
        if (this._popper) {
          // Ensure popper event listeners are removed cleanly
          this._popper.destroy();
        }

        this._popper = null;
      },
      getPopperConfig: function getPopperConfig() {
        var placement = AttachmentMap.BOTTOM;

        if (this.dropup) {
          placement = this.right ? AttachmentMap.TOPEND : AttachmentMap.TOP;
        } else if (this.dropright) {
          placement = AttachmentMap.RIGHT;
        } else if (this.dropleft) {
          placement = AttachmentMap.LEFT;
        } else if (this.right) {
          placement = AttachmentMap.BOTTOMEND;
        }

        var popperConfig = {
          placement: placement,
          modifiers: {
            offset: {
              offset: this.offset || 0
            },
            flip: {
              enabled: !this.noFlip
            }
          }
        };

        if (this.boundary) {
          popperConfig.modifiers.preventOverflow = {
            boundariesElement: this.boundary
          };
        }

        return _objectSpread({}, popperConfig, this.popperOpts || {});
      },
      whileOpenListen: function whileOpenListen(open) {
        // turn listeners on/off while open
        if (open) {
          // If another dropdown is opened
          this.$root.$on('bv::dropdown::shown', this.rootCloseListener); // Hide the dropdown when clicked outside

          this.listenForClickOut = true; // Hide the dropdown when it loses focus

          this.listenForFocusIn = true;
        } else {
          this.$root.$off('bv::dropdown::shown', this.rootCloseListener);
          this.listenForClickOut = false;
          this.listenForFocusIn = false;
        }
      },
      rootCloseListener: function rootCloseListener(vm) {
        if (vm !== this) {
          this.visible = false;
        }
      },
      show: function show() {
        // Public method to show dropdown
        if (this.disabled) {
          return;
        }

        this.visible = true;
      },
      hide: function hide() {
        var refocus = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        // Public method to hide dropdown
        if (this.disabled) {
          /* istanbul ignore next */
          return;
        }

        this.visible = false;

        if (refocus) {
          // Child element is closing the dropdown on click
          this.$once('hidden', this.focusToggler);
        }
      },
      toggle: function toggle(evt) {
        // Called only by a button that toggles the menu
        evt = evt || {};
        var type = evt.type;
        var key = evt.keyCode;

        if (type !== 'click' && !(type === 'keydown' && (key === KEY_CODES.ENTER || key === KEY_CODES.SPACE || key === KEY_CODES.DOWN))) {
          // We only toggle on Click, Enter, Space, and Arrow Down

          /* istanbul ignore next */
          return;
        }

        if (this.disabled) {
          /* istanbul ignore next */
          this.visible = false;
          /* istanbul ignore next */

          return;
        }

        this.$emit('toggle', evt);

        if (evt.defaultPrevented) {
          // Exit if canceled
          return;
        }

        evt.preventDefault();
        evt.stopPropagation(); // Toggle visibility

        this.visible = !this.visible;
      },
      click: function click(evt) {
        // Called only in split button mode, for the split button
        if (this.disabled) {
          /* istanbul ignore next */
          this.visible = false;
          /* istanbul ignore next */

          return;
        }

        this.$emit('click', evt);
      },
      onKeydown: function onKeydown(evt) {
        // Called from dropdown menu context
        var key = evt.keyCode;

        if (key === KEY_CODES.ESC) {
          // Close on ESC
          this.onEsc(evt);
        } else if (key === KEY_CODES.TAB) {
          // Close on tab out

          /* istanbul ignore next: not used and should be removed */
          this.onTab(evt);
        } else if (key === KEY_CODES.DOWN) {
          // Down Arrow
          this.focusNext(evt, false);
        } else if (key === KEY_CODES.UP) {
          // Up Arrow
          this.focusNext(evt, true);
        }
      },
      onEsc: function onEsc(evt) {
        if (this.visible) {
          this.visible = false;
          evt.preventDefault();
          evt.stopPropagation(); // Return focus to original trigger button

          this.$once('hidden', this.focusToggler);
        }
      },
      onTab: function onTab(evt)
      /* istanbul ignore next: not easy to test */
      {// TODO: Need special handler for dealing with form inputs
        // Tab, if in a text-like input, we should just focus next item in the dropdown
        // Note: Inputs are in a special .dropdown-form container
      },
      onMouseOver: function onMouseOver(evt)
      /* istanbul ignore next: not easy to test */
      {// Removed mouseover focus handler
      },
      // Document click out listener
      clickOutHandler: function clickOutHandler() {
        if (this.visible) {
          this.visible = false;
        }
      },
      // Document focusin listener
      focusInHandler: function focusInHandler(evt) {
        // If focus leaves dropdown, hide it
        if (this.visible && !contains(this.$refs.menu, evt.target) && !contains(this.$refs.toggle, evt.target)) {
          this.visible = false;
        }
      },
      // Keyboard nav
      focusNext: function focusNext(evt, up) {
        var _this2 = this;

        if (!this.visible) {
          /* istanbul ignore next: should never happen */
          return;
        }

        evt.preventDefault();
        evt.stopPropagation();
        this.$nextTick(function () {
          var items = _this2.getItems();

          if (items.length < 1) {
            /* istanbul ignore next: should never happen */
            return;
          }

          var index = items.indexOf(evt.target);

          if (up && index > 0) {
            index--;
          } else if (!up && index < items.length - 1) {
            index++;
          }

          if (index < 0) {
            /* istanbul ignore next: should never happen */
            index = 0;
          }

          _this2.focusItem(index, items);
        });
      },
      focusItem: function focusItem(idx, items) {
        var el = items.find(function (el, i) {
          return i === idx;
        });

        if (el && getAttr(el, 'tabindex') !== '-1') {
          el.focus();
        }
      },
      getItems: function getItems() {
        // Get all items
        return filterVisible(selectAll(Selector.ITEM_SELECTOR, this.$refs.menu));
      },
      focusMenu: function focusMenu() {
        this.$refs.menu.focus && this.$refs.menu.focus();
      },
      focusToggler: function focusToggler() {
        var toggler = this.toggler;

        if (toggler && toggler.focus) {
          toggler.focus();
        }
      }
    }
  };

  var NAME$8 = 'BDropdown';
  var props$o = {
    toggleText: {
      // This really should be toggleLabel
      type: String,
      default: function _default() {
        return String(getComponentConfig(NAME$8, 'toggleText'));
      }
    },
    size: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: function _default() {
        return String(getComponentConfig(NAME$8, 'variant') || '') || null;
      }
    },
    menuClass: {
      type: [String, Array],
      default: null
    },
    toggleTag: {
      type: String,
      default: 'button'
    },
    toggleClass: {
      type: [String, Array],
      default: null
    },
    noCaret: {
      type: Boolean,
      default: false
    },
    split: {
      type: Boolean,
      default: false
    },
    splitHref: {
      type: String // default: undefined

    },
    splitTo: {
      type: [String, Object] // default: undefined

    },
    splitVariant: {
      type: String,
      default: null
    },
    role: {
      type: String,
      default: 'menu'
    },
    boundary: {
      // String: `scrollParent`, `window` or `viewport`
      // Object: HTML Element reference
      type: [String, Object],
      default: 'scrollParent'
    } // @vue/component

  };
  var BDropdown = Vue.extend({
    name: NAME$8,
    mixins: [idMixin, dropdownMixin],
    props: props$o,
    computed: {
      dropdownClasses: function dropdownClasses() {
        // Position `static` is needed to allow menu to "breakout" of the scrollParent boundaries
        // when boundary is anything other than `scrollParent`
        // See https://github.com/twbs/bootstrap/issues/24251#issuecomment-341413786
        var positionStatic = this.boundary !== 'scrollParent' || !this.boundary;
        return ['btn-group', 'b-dropdown', 'dropdown', this.directionClass, {
          show: this.visible,
          'position-static': positionStatic
        }];
      },
      menuClasses: function menuClasses() {
        return ['dropdown-menu', {
          'dropdown-menu-right': this.right,
          show: this.visible
        }, this.menuClass];
      },
      toggleClasses: function toggleClasses() {
        return ['dropdown-toggle', {
          'dropdown-toggle-split': this.split,
          'dropdown-toggle-no-caret': this.noCaret && !this.split
        }, this.toggleClass];
      }
    },
    render: function render(h) {
      var split = h(false);

      if (this.split) {
        var btnProps = {
          disabled: this.disabled,
          variant: this.splitVariant || this.variant,
          size: this.size // We add these as needed due to router-link issues with defined property with undefined/null values

        };

        if (this.splitTo) {
          btnProps.to = this.splitTo;
        }

        if (this.splitHref) {
          btnProps.href = this.splitHref;
        }

        split = h(BButton, {
          ref: 'button',
          props: btnProps,
          attrs: {
            id: this.safeId('_BV_button_')
          },
          on: {
            click: this.click
          }
        }, [this.$slots['button-content'] || this.$slots.text || this.html || stripTags(this.text)]);
      }

      var toggle = h(BButton, {
        ref: 'toggle',
        class: this.toggleClasses,
        props: {
          variant: this.variant,
          size: this.size,
          disabled: this.disabled,
          tag: this.toggleTag
        },
        attrs: {
          id: this.safeId('_BV_toggle_'),
          'aria-haspopup': 'true',
          'aria-expanded': this.visible ? 'true' : 'false'
        },
        on: {
          click: this.toggle,
          // click
          keydown: this.toggle // enter, space, down

        }
      }, [this.split ? h('span', {
        class: ['sr-only']
      }, [this.toggleText]) : this.$slots['button-content'] || this.$slots.text || this.html || stripTags(this.text)]);
      var menu = h('ul', {
        ref: 'menu',
        class: this.menuClasses,
        attrs: {
          role: this.role,
          tabindex: '-1',
          'aria-labelledby': this.safeId(this.split ? '_BV_button_' : '_BV_toggle_')
        },
        on: {
          mouseover: this.onMouseOver,
          keydown: this.onKeydown // tab, up, down, esc

        }
      }, [this.$slots.default]);
      return h('div', {
        attrs: {
          id: this.safeId()
        },
        class: this.dropdownClasses
      }, [split, toggle, menu]);
    }
  });

  var props$p = propsFactory(); // @vue/component

  var BDropdownItem = Vue.extend({
    name: 'BDropdownItem',
    inject: {
      bvDropdown: {
        default: null
      }
    },
    props: props$p,
    methods: {
      closeDropdown: function closeDropdown() {
        var _this = this;

        // Close on next animation frame to allow <b-link> time to process
        requestAF(function () {
          if (_this.bvDropdown) {
            _this.bvDropdown.hide(true);
          }
        });
      },
      onClick: function onClick(evt) {
        this.$emit('click', evt);
        this.closeDropdown();
      }
    },
    render: function render(h) {
      return h('li', [h(BLink, {
        props: this.$props,
        staticClass: 'dropdown-item',
        attrs: {
          role: 'menuitem'
        },
        on: {
          click: this.onClick
        },
        ref: 'item'
      }, this.$slots.default)]);
    }
  });

  var props$q = {
    active: {
      type: Boolean,
      default: false
    },
    activeClass: {
      type: String,
      default: 'active'
    },
    disabled: {
      type: Boolean,
      default: false
    } // @vue/component

  };
  var BDropdownItemButton = Vue.extend({
    name: 'BDropdownItemButton',
    inject: {
      bvDropdown: {
        default: null
      }
    },
    props: props$q,
    methods: {
      closeDropdown: function closeDropdown() {
        if (this.bvDropdown) {
          this.bvDropdown.hide(true);
        }
      },
      onClick: function onClick(evt) {
        this.$emit('click', evt);
        this.closeDropdown();
      }
    },
    render: function render(h) {
      return h('li', [h('button', {
        staticClass: 'dropdown-item',
        class: _defineProperty({}, this.activeClass, this.active),
        attrs: {
          role: 'menuitem',
          type: 'button',
          disabled: this.disabled
        },
        on: {
          click: this.onClick
        },
        ref: 'button'
      }, this.$slots.default)]);
    }
  });

  var props$r = {
    id: {
      type: String,
      default: null
    },
    tag: {
      type: String,
      default: 'h6'
    } // @vue/component

  };
  var BDropdownHeader = Vue.extend({
    name: 'BDropdownHeader',
    functional: true,
    props: props$r,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h('li', [h(props.tag, mergeData(data, {
        staticClass: 'dropdown-header',
        attrs: {
          id: props.id || null
        },
        ref: 'header'
      }), children)]);
    }
  });

  var props$s = {
    tag: {
      type: String,
      default: 'hr'
    } // @vue/component

  };
  var BDropdownDivider = Vue.extend({
    name: 'BDropdownDivider',
    functional: true,
    props: props$s,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data;
      return h('li', [h(props.tag, mergeData(data, {
        staticClass: 'dropdown-divider',
        attrs: {
          role: 'separator'
        },
        ref: 'divider'
      }))]);
    }
  });

  var props$t = {
    id: {
      type: String,
      default: null
    },
    inline: {
      type: Boolean,
      default: false
    },
    novalidate: {
      type: Boolean,
      default: false
    },
    validated: {
      type: Boolean,
      default: false
    } // @vue/component

  };
  var BForm = Vue.extend({
    name: 'BForm',
    functional: true,
    props: props$t,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h('form', mergeData(data, {
        class: {
          'form-inline': props.inline,
          'was-validated': props.validated
        },
        attrs: {
          id: props.id,
          novalidate: props.novalidate
        }
      }), children);
    }
  });

  var BDropdownForm = Vue.extend({
    name: 'BDropdownForm',
    functional: true,
    props: _objectSpread({}, props$t),
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h('li', [h(BForm, mergeData(data, {
        staticClass: 'b-dropdown-form',
        props: props,
        ref: 'form'
      }), children)]);
    }
  });

  var BDropdownText = Vue.extend({
    name: 'BDropdownText',
    functional: true,
    props: {
      tag: {
        type: String,
        default: 'p'
      }
    },
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h('li', [h(props.tag, mergeData(data, {
        staticClass: 'b-dropdown-text',
        props: props,
        ref: 'text'
      }), children)]);
    }
  });

  var components$b = {
    BDropdown: BDropdown,
    BDd: BDropdown,
    BDropdownItem: BDropdownItem,
    BDdItem: BDropdownItem,
    BDropdownItemButton: BDropdownItemButton,
    BDropdownItemBtn: BDropdownItemButton,
    BDdItemButton: BDropdownItemButton,
    BDdItemBtn: BDropdownItemButton,
    BDropdownHeader: BDropdownHeader,
    BDdHeader: BDropdownHeader,
    BDropdownDivider: BDropdownDivider,
    BDdDivider: BDropdownDivider,
    BDropdownForm: BDropdownForm,
    BDdForm: BDropdownForm,
    BDropdownText: BDropdownText,
    BDdText: BDropdownText
  };
  var DropdownPlugin = {
    install: installFactory({
      components: components$b
    })
  };

  var props$u = {
    type: {
      type: String,
      default: 'iframe',
      validator: function validator(str) {
        return arrayIncludes(['iframe', 'embed', 'video', 'object', 'img', 'b-img', 'b-img-lazy'], str);
      }
    },
    tag: {
      type: String,
      default: 'div'
    },
    aspect: {
      type: String,
      default: '16by9'
    } // @vue/component

  };
  var BEmbed = Vue.extend({
    name: 'BEmbed',
    functional: true,
    props: props$u,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.tag, {
        ref: data.ref,
        staticClass: 'embed-responsive',
        class: _defineProperty({}, "embed-responsive-".concat(props.aspect), Boolean(props.aspect))
      }, [h(props.type, mergeData(data, {
        ref: '',
        staticClass: 'embed-responsive-item'
      }), children)]);
    }
  });

  var components$c = {
    BEmbed: BEmbed
  };
  var index$a = {
    install: installFactory({
      components: components$c
    })
  };

  var formOptionsMixin = {
    props: {
      options: {
        type: [Array, Object],
        default: function _default() {
          return [];
        }
      },
      valueField: {
        type: String,
        default: 'value'
      },
      textField: {
        type: String,
        default: 'text'
      },
      htmlField: {
        type: String,
        default: 'html'
      },
      disabledField: {
        type: String,
        default: 'disabled'
      }
    },
    computed: {
      formOptions: function formOptions() {
        var options = this.options;
        var valueField = this.valueField;
        var textField = this.textField;
        var htmlField = this.htmlField;
        var disabledField = this.disabledField;

        if (isArray$1(options)) {
          // Normalize flat-ish arrays to Array of Objects
          return options.map(function (option) {
            if (isPlainObject(option)) {
              var value = option[valueField];
              var text = String(option[textField]);
              return {
                value: isUndefined(value) ? text : value,
                text: stripTags(text),
                html: option[htmlField],
                disabled: Boolean(option[disabledField])
              };
            }

            return {
              value: option,
              text: stripTags(String(option)),
              disabled: false
            };
          });
        } else {
          // options is Object
          // Normalize Objects to Array of Objects
          return keys(options).map(function (key) {
            var option = options[key] || {};

            if (isPlainObject(option)) {
              var value = option[valueField];
              var text = option[textField];
              return {
                value: isUndefined(value) ? key : value,
                text: isUndefined(text) ? stripTags(String(key)) : stripTags(String(text)),
                html: option[htmlField],
                disabled: Boolean(option[disabledField])
              };
            }

            return {
              value: key,
              text: stripTags(String(option)),
              disabled: false
            };
          });
        }
      }
    }
  };

  var BFormDatalist = Vue.extend({
    name: 'BFormDatalist',
    mixins: [formOptionsMixin],
    props: {
      id: {
        type: String,
        default: null,
        required: true
      }
    },
    render: function render(h) {
      var options = this.formOptions.map(function (option, index) {
        return h('option', {
          key: "option_".concat(index, "_opt"),
          attrs: {
            disabled: option.disabled
          },
          domProps: _objectSpread({}, htmlOrText(option.html, option.text), {
            value: option.value
          })
        });
      });
      return h('datalist', {
        attrs: {
          id: this.id
        }
      }, [options, this.$slots.default]);
    }
  });

  var NAME$9 = 'BFormText';
  var props$v = {
    id: {
      type: String,
      default: null
    },
    tag: {
      type: String,
      default: 'small'
    },
    textVariant: {
      type: String,
      default: function _default() {
        return String(getComponentConfig(NAME$9, 'textVariant') || '');
      }
    },
    inline: {
      type: Boolean,
      default: false
    } // @vue/component

  };
  var BFormText = Vue.extend({
    name: NAME$9,
    functional: true,
    props: props$v,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.tag, mergeData(data, {
        class: _defineProperty({
          'form-text': !props.inline
        }, "text-".concat(props.textVariant), Boolean(props.textVariant)),
        attrs: {
          id: props.id
        }
      }), children);
    }
  });

  var props$w = {
    id: {
      type: String,
      default: null
    },
    tag: {
      type: String,
      default: 'div'
    },
    tooltip: {
      type: Boolean,
      default: false
    },
    forceShow: {
      type: Boolean,
      default: false
    },
    state: {
      type: [Boolean, String],
      default: null
    },
    ariaLive: {
      type: String,
      default: null
    },
    role: {
      type: String,
      default: null
    } // @vue/component

  };
  var BFormInvalidFeedback = Vue.extend({
    name: 'BFormInvalidFeedback',
    functional: true,
    props: props$w,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      var show = props.forceShow === true || props.state === false || props.state === 'invalid';
      return h(props.tag, mergeData(data, {
        class: {
          'invalid-feedback': !props.tooltip,
          'invalid-tooltip': props.tooltip,
          'd-block': show
        },
        attrs: {
          id: props.id,
          role: props.role,
          'aria-live': props.ariaLive,
          'aria-atomic': props.ariaLive ? 'true' : null
        }
      }), children);
    }
  });

  var props$x = {
    id: {
      type: String,
      default: null
    },
    tag: {
      type: String,
      default: 'div'
    },
    tooltip: {
      type: Boolean,
      default: false
    },
    forceShow: {
      type: Boolean,
      default: false
    },
    state: {
      type: [Boolean, String],
      default: null
    },
    ariaLive: {
      type: String,
      default: null
    },
    role: {
      type: String,
      default: null
    } // @vue/component

  };
  var BFormValidFeedback = Vue.extend({
    name: 'BFormValidFeedback',
    functional: true,
    props: props$x,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      var show = props.forceShow === true || props.state === true || props.state === 'valid';
      return h(props.tag, mergeData(data, {
        class: {
          'valid-feedback': !props.tooltip,
          'valid-tooltip': props.tooltip,
          'd-block': show
        },
        attrs: {
          id: props.id,
          role: props.role,
          'aria-live': props.ariaLive,
          'aria-atomic': props.ariaLive ? 'true' : null
        }
      }), children);
    }
  });

  var components$d = {
    BForm: BForm,
    BFormDatalist: BFormDatalist,
    BDatalist: BFormDatalist,
    BFormRow: BFormRow,
    BFormText: BFormText,
    BFormInvalidFeedback: BFormInvalidFeedback,
    BFormFeedback: BFormInvalidFeedback,
    BFormValidFeedback: BFormValidFeedback
  };
  var index$b = {
    install: installFactory({
      components: components$d
    })
  };

  /* Form control contextual state class computation
   *
   * Returned class is either 'is-valid' or 'is-invalid' based on the 'state' prop
   * state can be one of five values:
   *  - true or 'valid' for is-valid
   *  - false or 'invalid' for is-invalid
   *  - null (or empty string) for no contextual state
   */
  // @vue/component
  var formStateMixin = {
    props: {
      state: {
        // true/'valid', false/'invalid', '',null
        // The order must be String first, then Boolean!
        type: [String, Boolean],
        default: null
      }
    },
    computed: {
      computedState: function computedState() {
        var state = this.state;

        if (state === '') {
          return null;
        } else if (state === true || state === 'valid') {
          return true;
        } else if (state === false || state === 'invalid') {
          return false;
        }

        return null;
      },
      stateClass: function stateClass() {
        var state = this.computedState;

        if (state === true) {
          return 'is-valid';
        } else if (state === false) {
          return 'is-invalid';
        }

        return null;
      }
    }
  };

  var NAME$a = 'BFormGroup'; // Selector for finding first input in the form-group

  var SELECTOR = 'input:not([disabled]),textarea:not([disabled]),select:not([disabled])';
  var DEPRECATED_MSG = 'Props "horizontal" and "breakpoint" are deprecated. Use "label-cols(-{breakpoint})" props instead.'; // Render helper functions (here rather than polluting the instance with more methods)

  var renderInvalidFeedback = function renderInvalidFeedback(h, ctx) {
    var content = ctx.$slots['invalid-feedback'] || ctx.invalidFeedback;
    var invalidFeedback = h(false);

    if (content) {
      invalidFeedback = h(BFormInvalidFeedback, {
        props: {
          id: ctx.invalidFeedbackId,
          // If state is explicitly false, always show the feedback
          state: ctx.computedState,
          tooltip: ctx.tooltip,
          ariaLive: ctx.feedbackAriaLive,
          role: ctx.feedbackAriaLive ? 'alert' : null
        },
        attrs: {
          tabindex: content ? '-1' : null
        }
      }, [content]);
    }

    return invalidFeedback;
  };

  var renderValidFeedback = function renderValidFeedback(h, ctx) {
    var content = ctx.$slots['valid-feedback'] || ctx.validFeedback;
    var validFeedback = h(false);

    if (content) {
      validFeedback = h(BFormValidFeedback, {
        props: {
          id: ctx.validFeedbackId,
          // If state is explicitly true, always show the feedback
          state: ctx.computedState,
          tooltip: ctx.tooltip,
          ariaLive: ctx.feedbackAriaLive,
          role: ctx.feedbackAriaLive ? 'alert' : null
        },
        attrs: {
          tabindex: content ? '-1' : null
        }
      }, [content]);
    }

    return validFeedback;
  };

  var renderHelpText = function renderHelpText(h, ctx) {
    // Form help text (description)
    var content = ctx.$slots['description'] || ctx.description;
    var description = h(false);

    if (content) {
      description = h(BFormText, {
        attrs: {
          id: ctx.descriptionId,
          tabindex: content ? '-1' : null
        }
      }, [content]);
    }

    return description;
  };

  var renderLabel = function renderLabel(h, ctx) {
    // Render label/legend inside b-col if necessary
    var content = ctx.$slots['label'] || ctx.label;
    var labelFor = ctx.labelFor;
    var isLegend = !labelFor;
    var isHorizontal = ctx.isHorizontal;
    var labelTag = isLegend ? 'legend' : 'label';

    if (!content && !isHorizontal) {
      return h(false);
    } else if (ctx.labelSrOnly) {
      var label = h(false);

      if (content) {
        label = h(labelTag, {
          class: 'sr-only',
          attrs: {
            id: ctx.labelId,
            for: labelFor || null
          }
        }, [content]);
      }

      return h(isHorizontal ? BCol : 'div', {
        props: isHorizontal ? ctx.labelColProps : {}
      }, [label]);
    } else {
      return h(isHorizontal ? BCol : labelTag, {
        on: isLegend ? {
          click: ctx.legendClick
        } : {},
        props: isHorizontal ? _objectSpread({
          tag: labelTag
        }, ctx.labelColProps) : {},
        attrs: {
          id: ctx.labelId,
          for: labelFor || null,
          // We add a tab index to legend so that screen readers
          // will properly read the aria-labelledby in IE.
          tabindex: isLegend ? '-1' : null
        },
        class: [// When horizontal or if a legend is rendered, add col-form-label
        // for correct sizing as Bootstrap has inconsistent font styling
        // for legend in non-horizontal form-groups.
        // See: https://github.com/twbs/bootstrap/issues/27805
        isHorizontal || isLegend ? 'col-form-label' : '', // Emulate label padding top of 0 on legend when not horizontal
        !isHorizontal && isLegend ? 'pt-0' : '', // If not horizontal and not a legend, we add d-block to label
        // so that label-align works
        !isHorizontal && !isLegend ? 'd-block' : '', ctx.labelSize ? "col-form-label-".concat(ctx.labelSize) : '', ctx.labelAlignClasses, ctx.labelClass]
      }, [content]);
    }
  }; // -- BFormGroup Prop factory -- used for lazy generation of props
  // Memoize this function to return cached values to
  // save time in computed functions


  var makePropName = memoize(function () {
    var breakpoint = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var prefix = arguments.length > 1 ? arguments[1] : undefined;
    return "".concat(prefix).concat(upperFirst(breakpoint));
  }); // BFormgroup prop generator for lazy generation of props

  var generateProps$1 = function generateProps() {
    var BREAKPOINTS = getBreakpointsUpCached(); // Generate the labelCol breakpoint props

    var bpLabelColProps = BREAKPOINTS.reduce(function (props, breakpoint) {
      // i.e. label-cols, label-cols-sm, label-cols-md, ...
      props[makePropName(breakpoint, 'labelCols')] = {
        type: [Number, String, Boolean],
        default: breakpoint ? false : null
      };
      return props;
    }, create(null)); // Generate the labelAlign breakpoint props

    var bpLabelAlignProps = BREAKPOINTS.reduce(function (props, breakpoint) {
      // label-align, label-align-sm, label-align-md, ...
      props[makePropName(breakpoint, 'labelAlign')] = {
        type: String,
        // left, right, center
        default: null
      };
      return props;
    }, create(null));
    return _objectSpread({
      label: {
        type: String,
        default: null
      },
      labelFor: {
        type: String,
        default: null
      },
      labelSize: {
        type: String,
        default: null
      },
      labelSrOnly: {
        type: Boolean,
        default: false
      }
    }, bpLabelColProps, bpLabelAlignProps, {
      labelClass: {
        type: [String, Array, Object],
        default: null
      },
      description: {
        type: String,
        default: null
      },
      invalidFeedback: {
        type: String,
        default: null
      },
      validFeedback: {
        type: String,
        default: null
      },
      tooltip: {
        // Enable tooltip style feedback
        type: Boolean,
        default: false
      },
      feedbackAriaLive: {
        type: String,
        default: 'assertive'
      },
      validated: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      horizontal: {
        // Deprecated
        type: Boolean,
        default: false,
        deprecated: DEPRECATED_MSG
      },
      breakpoint: {
        // Deprecated (ignored if horizontal is not true)
        type: String,
        default: null,
        // legacy value 'sm',
        deprecated: DEPRECATED_MSG
      }
    });
  }; // We do not use Vue.extend here as that would evaluate the props
  // immediately, which we do not want to happen
  // @vue/component


  var BFormGroup = {
    name: NAME$a,
    mixins: [idMixin, formStateMixin],

    get props() {
      // Allow props to be lazy evaled on first access and
      // then they become a non-getter afterwards.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Smart_self-overwriting_lazy_getters
      delete this.props; // eslint-disable-next-line no-return-assign

      return this.props = generateProps$1();
    },

    computed: {
      labelColProps: function labelColProps() {
        var _this = this;

        var props = {};
        /* istanbul ignore next: deprecated */

        if (this.horizontal) {
          // Deprecated setting of horizontal/breakpoint props

          /* istanbul ignore next */
          warn("b-form-group: ".concat(DEPRECATED_MSG)); // Legacy default is breakpoint sm and cols 3

          var bp = this.breakpoint || getBreakpointsUpCached()[1]; // 'sm'

          var cols = parseInt(this.labelCols, 10) || 3;
          props[bp] = cols > 0 ? cols : 3; // We then return the single breakpoint prop for legacy compatibility

          return props;
        }

        getBreakpointsUpCached().forEach(function (breakpoint) {
          // Grab the value if the label column breakpoint prop
          var propVal = _this[makePropName(breakpoint, 'labelCols')]; // Handle case where the prop's value is an empty string,
          // which represents true


          propVal = propVal === '' ? true : propVal || false;

          if (!isBoolean(propVal)) {
            // Convert to column size to number
            propVal = parseInt(propVal, 10) || 0; // Ensure column size is greater than 0

            propVal = propVal > 0 ? propVal : false;
          }

          if (propVal) {
            // Add the prop to the list of props to give to b-col
            // If breakpoint is '' (labelCols=true), then we use the
            // col prop to make equal width at xs
            var bColPropName = breakpoint || (isBoolean(propVal) ? 'col' : 'cols'); // Add it to the props

            props[bColPropName] = propVal;
          }
        });
        return props;
      },
      labelAlignClasses: function labelAlignClasses() {
        var _this2 = this;

        var classes = [];
        getBreakpointsUpCached().forEach(function (breakpoint) {
          // Assemble the label column breakpoint align classes
          var propVal = _this2[makePropName(breakpoint, 'labelAlign')] || null;

          if (propVal) {
            var className = breakpoint ? "text-".concat(breakpoint, "-").concat(propVal) : "text-".concat(propVal);
            classes.push(className);
          }
        });
        return classes;
      },
      isHorizontal: function isHorizontal() {
        // Determine if the resultant form-group will be rendered
        // horizontal (meaning it has label-col breakpoints)
        return keys(this.labelColProps).length > 0;
      },
      labelId: function labelId() {
        return this.$slots['label'] || this.label ? this.safeId('_BV_label_') : null;
      },
      descriptionId: function descriptionId() {
        return this.$slots['description'] || this.description ? this.safeId('_BV_description_') : null;
      },
      hasInvalidFeedback: function hasInvalidFeedback() {
        // Used for computing aria-describedby
        var $slots = this.$slots;
        return this.computedState === false && ($slots['invalid-feedback'] || this.invalidFeedback);
      },
      invalidFeedbackId: function invalidFeedbackId() {
        return this.hasInvalidFeedback ? this.safeId('_BV_feedback_invalid_') : null;
      },
      hasValidFeedback: function hasValidFeedback() {
        // Used for computing aria-describedby
        return this.computedState === true && (this.$slots['valid-feedback'] || this.validFeedback);
      },
      validFeedbackId: function validFeedbackId() {
        return this.hasValidFeedback ? this.safeId('_BV_feedback_valid_') : null;
      },
      describedByIds: function describedByIds() {
        // Screen readers will read out any content linked to by aria-describedby
        // even if the content is hidden with `display: none;`, hence we only include
        // feedback IDs if the form-group's state is explicitly valid or invalid.
        return [this.descriptionId, this.invalidFeedbackId, this.validFeedbackId].filter(Boolean).join(' ') || null;
      }
    },
    watch: {
      describedByIds: function describedByIds(add, remove) {
        if (add !== remove) {
          this.setInputDescribedBy(add, remove);
        }
      }
    },
    mounted: function mounted() {
      var _this3 = this;

      this.$nextTick(function () {
        // Set the aria-describedby IDs on the input specified by label-for
        // We do this in a nextTick to ensure the children have finished rendering
        _this3.setInputDescribedBy(_this3.describedByIds);
      });
    },
    methods: {
      legendClick: function legendClick(evt) {
        if (this.labelFor) {
          // Don't do anything if labelFor is set

          /* istanbul ignore next: clicking a label will focus the input, so no need to test */
          return;
        }

        var tagName = evt.target ? evt.target.tagName : '';

        if (/^(input|select|textarea|label|button|a)$/i.test(tagName)) {
          // If clicked an interactive element inside legend,
          // we just let the default happen

          /* istanbul ignore next */
          return;
        }

        var inputs = selectAll(SELECTOR, this.$refs.content).filter(isVisible);

        if (inputs && inputs.length === 1 && inputs[0].focus) {
          // if only a single input, focus it, emulating label behaviour
          inputs[0].focus();
        }
      },
      setInputDescribedBy: function setInputDescribedBy(add, remove) {
        // Sets the `aria-describedby` attribute on the input if label-for is set.
        // Optionally accepts a string of IDs to remove as the second parameter.
        // Preserves any aria-describedby value(s) user may have on input.
        if (this.labelFor && isBrowser) {
          var input = select("#".concat(this.labelFor), this.$refs.content);

          if (input) {
            var adb = 'aria-describedby';
            var ids = (getAttr(input, adb) || '').split(/\s+/);
            add = (add || '').split(/\s+/);
            remove = (remove || '').split(/\s+/); // Update ID list, preserving any original IDs
            // and ensuring the ID's are unique

            ids = ids.filter(function (id) {
              return !arrayIncludes(remove, id);
            }).concat(add).filter(Boolean);
            ids = keys(ids.reduce(function (memo, id) {
              return _objectSpread({}, memo, _defineProperty({}, id, true));
            }, {})).join(' ').trim();

            if (ids) {
              setAttr(input, adb, ids);
            } else {
              // No IDs, so remove the attribute
              removeAttr(input, adb);
            }
          }
        }
      }
    },
    render: function render(h) {
      var isFieldset = !this.labelFor;
      var isHorizontal = this.isHorizontal; // Generate the label

      var label = renderLabel(h, this); // Generate the content

      var content = h(isHorizontal ? BCol : 'div', {
        ref: 'content',
        attrs: {
          tabindex: isFieldset ? '-1' : null,
          role: isFieldset ? 'group' : null
        }
      }, [this.$slots['default'] || h(false), renderInvalidFeedback(h, this), renderValidFeedback(h, this), renderHelpText(h, this)]); // Create the form-group

      var data = {
        staticClass: 'form-group',
        class: [this.validated ? 'was-validated' : null, this.stateClass],
        attrs: {
          id: this.safeId(),
          disabled: isFieldset ? this.disabled : null,
          role: isFieldset ? null : 'group',
          'aria-invalid': this.computedState === false ? 'true' : null,
          // Only apply aria-labelledby if we are a horizontal fieldset
          // as the legend is no longer a direct child of fieldset
          'aria-labelledby': isFieldset && isHorizontal ? this.labelId : null,
          // Only apply aria-describedby IDs if we are a fieldset
          // as the input will have the IDs when not a fieldset
          'aria-describedby': isFieldset ? this.describedByIds : null
        } // Return it wrapped in a form-group
        // Note: Fieldsets do not support adding `row` or `form-row` directly
        // to them due to browser specific render issues, so we move the `form-row`
        // to an inner wrapper div when horizontal and using a fieldset

      };
      return h(isFieldset ? 'fieldset' : isHorizontal ? BFormRow : 'div', data, isHorizontal && isFieldset ? [h(BFormRow, {}, [label, content])] : [label, content]);
    }
  };

  var components$e = {
    BFormGroup: BFormGroup,
    BFormFieldset: BFormGroup
  };
  var index$c = {
    install: installFactory({
      components: components$e
    })
  };

  // Handles when arrays are "sparse" (array.every(...) doesn't handle sparse)

  var compareArrays = function compareArrays(a, b) {
    if (a.length !== b.length) {
      return false;
    }

    var equal = true;

    for (var i = 0; equal && i < a.length; i++) {
      equal = looseEqual(a[i], b[i]);
    }

    return equal;
  };
  /**
   * Check if two values are loosely equal - that is,
   * if they are plain objects, do they have the same shape?
   * Returns boolean true or false
   */


  var looseEqual = function looseEqual(a, b) {
    if (a === b) {
      return true;
    }

    var aValidType = isDate(a);
    var bValidType = isDate(b);

    if (aValidType || bValidType) {
      return aValidType && bValidType ? a.getTime() === b.getTime() : false;
    }

    aValidType = isArray$1(a);
    bValidType = isArray$1(b);

    if (aValidType || bValidType) {
      return aValidType && bValidType ? compareArrays(a, b) : false;
    }

    aValidType = isObject(a);
    bValidType = isObject(b);

    if (aValidType || bValidType) {
      /* istanbul ignore if: this if will probably never be called */
      if (!aValidType || !bValidType) {
        return false;
      }

      var aKeysCount = keys(a).length;
      var bKeysCount = keys(b).length;

      if (aKeysCount !== bKeysCount) {
        return false;
      }

      for (var key in a) {
        var aHasKey = a.hasOwnProperty(key);
        var bHasKey = b.hasOwnProperty(key);

        if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) {
          return false;
        }
      }
    }

    return String(a) === String(b);
  };

  var looseIndexOf = function looseIndexOf(arr, val) {
    // Assumes that the first argument is an array
    for (var i = 0; i < arr.length; i++) {
      if (looseEqual(arr[i], val)) {
        return i;
      }
    }

    return -1;
  };

  // @vue/component
  var formMixin = {
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

  // @vue/component
  var formRadioCheckMixin = {
    model: {
      prop: 'checked',
      event: 'input'
    },
    props: {
      value: {// Value when checked
        // type: Object,
        // default: undefined
      },
      checked: {// This is the v-model
        // type: Object,
        // default: undefined
      },
      inline: {
        type: Boolean,
        default: false
      },
      plain: {
        type: Boolean,
        default: false
      },
      button: {
        // Only applicable in standalone mode (non group)
        type: Boolean,
        default: false
      },
      buttonVariant: {
        // Only applicable when rendered with button style
        type: String,
        default: null
      },
      ariaLabel: {
        // Placed on the input if present.
        type: String,
        default: null
      },
      ariaLabelledby: {
        // Placed on the input if present.
        type: String,
        default: null
      }
    },
    data: function data() {
      return {
        localChecked: this.is_Group ? this.bvGroup.checked : this.checked,
        hasFocus: false
      };
    },
    computed: {
      computedLocalChecked: {
        get: function get() {
          return this.is_Group ? this.bvGroup.localChecked : this.localChecked;
        },
        set: function set(val) {
          if (this.is_Group) {
            this.bvGroup.localChecked = val;
          } else {
            this.localChecked = val;
          }
        }
      },
      is_Group: function is_Group() {
        // Is this check/radio a child of check-group or radio-group?
        return Boolean(this.bvGroup);
      },
      is_BtnMode: function is_BtnMode() {
        // Support button style in single input mode
        return this.is_Group ? this.bvGroup.buttons : this.button;
      },
      is_Plain: function is_Plain() {
        return this.is_BtnMode ? false : this.is_Group ? this.bvGroup.plain : this.plain;
      },
      is_Custom: function is_Custom() {
        return this.is_BtnMode ? false : !this.is_Plain;
      },
      is_Switch: function is_Switch() {
        // Custom switch styling (checkboxes only)
        return this.is_BtnMode || this.is_Radio || this.is_Plain ? false : this.is_Group ? this.bvGroup.switches : this.switch;
      },
      is_Inline: function is_Inline() {
        return this.is_Group ? this.bvGroup.inline : this.inline;
      },
      is_Disabled: function is_Disabled() {
        // Child can be disabled while parent isn't, but is always disabled if group is
        return this.is_Group ? this.bvGroup.disabled || this.disabled : this.disabled;
      },
      is_Required: function is_Required() {
        // Required only works when a name is provided for the input(s)
        // Child can only be required when parent is
        // Groups will always have a name (either user supplied or auto generated)
        return Boolean(this.get_Name && (this.is_Group ? this.bvGroup.required : this.required));
      },
      get_Name: function get_Name() {
        // Group name preferred over local name
        return (this.is_Group ? this.bvGroup.groupName : this.name) || null;
      },
      get_Form: function get_Form() {
        return (this.is_Group ? this.bvGroup.form : this.form) || null;
      },
      get_Size: function get_Size() {
        return (this.is_Group ? this.bvGroup.size : this.size) || '';
      },
      get_State: function get_State() {
        return this.is_Group ? this.bvGroup.computedState : this.computedState;
      },
      get_ButtonVariant: function get_ButtonVariant() {
        // Local variant preferred over group variant
        if (this.buttonVariant) {
          return this.buttonVariant;
        } else if (this.is_Group && this.bvGroup.buttonVariant) {
          return this.bvGroup.buttonVariant;
        } // default variant


        return 'secondary';
      },
      buttonClasses: function buttonClasses() {
        // Same for radio & check
        return ['btn', "btn-".concat(this.get_ButtonVariant), this.get_Size ? "btn-".concat(this.get_Size) : '', // 'disabled' class makes "button" look disabled
        this.is_Disabled ? 'disabled' : '', // 'active' class makes "button" look pressed
        this.is_Checked ? 'active' : '', // Focus class makes button look focused
        this.hasFocus ? 'focus' : ''];
      }
    },
    watch: {
      checked: function checked(newVal, oldVal) {
        this.computedLocalChecked = newVal;
      }
    },
    methods: {
      handleFocus: function handleFocus(evt) {
        // When in buttons mode, we need to add 'focus' class to label when input focused
        // As it is the hidden input which has actual focus
        if (evt.target) {
          if (evt.type === 'focus') {
            this.hasFocus = true;
          } else if (evt.type === 'blur') {
            this.hasFocus = false;
          }
        }
      },
      // Convenience methods for focusing the input
      focus: function focus() {
        if (!this.is_Disabled && this.$refs.input && this.$refs.input.focus) {
          this.$refs.input.focus();
        }
      },
      blur: function blur() {
        if (!this.is_Disabled && this.$refs.input && this.$refs.input.blur) {
          this.$refs.input.blur();
        }
      }
    },
    render: function render(h) {
      var defaultSlot = this.$slots.default; // Generate the input element

      var on = {
        change: this.handleChange
      };

      if (this.is_BtnMode) {
        // Handlers for focus styling when in button mode
        on.focus = on.blur = this.handleFocus;
      }

      var input = h('input', {
        ref: 'input',
        key: 'input',
        on: on,
        class: {
          'form-check-input': this.is_Plain,
          'custom-control-input': this.is_Custom,
          'is-valid': this.get_State === true && !this.is_BtnMode,
          'is-invalid': this.get_State === false && !this.is_BtnMode,
          // https://github.com/bootstrap-vue/bootstrap-vue/issues/2911
          'position-static': this.is_Plain && !defaultSlot
        },
        directives: [{
          name: 'model',
          rawName: 'v-model',
          value: this.computedLocalChecked,
          expression: 'computedLocalChecked'
        }],
        attrs: {
          id: this.safeId(),
          type: this.is_Radio ? 'radio' : 'checkbox',
          name: this.get_Name,
          form: this.get_Form,
          disabled: this.is_Disabled,
          required: this.is_Required,
          autocomplete: 'off',
          'aria-required': this.is_Required || null,
          'aria-label': this.ariaLabel || null,
          'aria-labelledby': this.ariaLabelledby || null
        },
        domProps: {
          value: this.value,
          checked: this.is_Checked
        }
      });

      if (this.is_BtnMode) {
        // Button mode
        var button = h('label', {
          class: this.buttonClasses
        }, [input, defaultSlot]);

        if (!this.is_Group) {
          // Standalone button mode, so wrap in 'btn-group-toggle'
          // and flag it as inline-block to mimic regular buttons
          button = h('div', {
            class: ['btn-group-toggle', 'd-inline-block']
          }, [button]);
        }

        return button;
      } else {
        // Not button mode
        var label = h(false); // If no label content in plain mode we dont render the label
        // https://github.com/bootstrap-vue/bootstrap-vue/issues/2911

        if (!(this.is_Plain && !defaultSlot)) {
          label = h('label', {
            class: {
              'form-check-label': this.is_Plain,
              'custom-control-label': this.is_Custom
            },
            attrs: {
              for: this.safeId()
            }
          }, defaultSlot);
        } // Wrap it in a div


        return h('div', {
          class: _defineProperty({
            'form-check': this.is_Plain,
            'form-check-inline': this.is_Plain && this.is_Inline,
            'custom-control': this.is_Custom,
            'custom-control-inline': this.is_Custom && this.is_Inline,
            'custom-checkbox': this.is_Custom && this.is_Check && !this.is_Switch,
            'custom-switch': this.is_Switch,
            'custom-radio': this.is_Custom && this.is_Radio
          }, "form-control-".concat(this.get_Size), Boolean(this.get_Size && !this.is_BtnMode))
        }, [input, label]);
      }
    }
  };

  // @vue/component
  var formSizeMixin = {
    props: {
      size: {
        type: String,
        default: null
      }
    },
    computed: {
      sizeFormClass: function sizeFormClass() {
        return [this.size ? "form-control-".concat(this.size) : null];
      },
      sizeBtnClass: function sizeBtnClass()
      /* istanbul ignore next: don't think this is used */
      {
        return [this.size ? "btn-".concat(this.size) : null];
      }
    }
  };

  var BFormCheckbox = Vue.extend({
    name: 'BFormCheckbox',
    mixins: [formRadioCheckMixin, // Includes shared render function
    idMixin, formMixin, formSizeMixin, formStateMixin],
    inject: {
      bvGroup: {
        from: 'bvCheckGroup',
        default: false
      }
    },
    props: {
      value: {
        // type: [Object, Boolean],
        default: true
      },
      uncheckedValue: {
        // type: [Object, Boolean],
        // Not applicable in multi-check mode
        default: false
      },
      indeterminate: {
        // Not applicable in multi-check mode
        type: Boolean,
        default: false
      },
      switch: {
        // Custom switch styling
        type: Boolean,
        default: false
      },
      checked: {
        // v-model
        type: [String, Number, Object, Array, Boolean],
        default: null
      }
    },
    computed: {
      is_Checked: function is_Checked() {
        var checked = this.computedLocalChecked;
        var value = this.value;

        if (isArray$1(checked)) {
          return looseIndexOf(checked, value) > -1;
        } else {
          return looseEqual(checked, value);
        }
      },
      is_Radio: function is_Radio() {
        return false;
      },
      is_Check: function is_Check() {
        return true;
      }
    },
    watch: {
      computedLocalChecked: function computedLocalChecked(newVal, oldVal) {
        this.$emit('input', newVal);

        if (this.$refs && this.$refs.input) {
          this.$emit('update:indeterminate', this.$refs.input.indeterminate);
        }
      },
      indeterminate: function indeterminate(newVal, oldVal) {
        this.setIndeterminate(newVal);
      }
    },
    mounted: function mounted() {
      // Set initial indeterminate state
      this.setIndeterminate(this.indeterminate);
    },
    methods: {
      handleChange: function handleChange(_ref) {
        var _ref$target = _ref.target,
            checked = _ref$target.checked,
            indeterminate = _ref$target.indeterminate;
        var localChecked = this.computedLocalChecked;
        var value = this.value;
        var isArr = isArray$1(localChecked);
        var uncheckedValue = isArr ? null : this.uncheckedValue; // Update computedLocalChecked

        if (isArr) {
          var idx = looseIndexOf(localChecked, value);

          if (checked && idx < 0) {
            // Add value to array
            localChecked = localChecked.concat(value);
          } else if (!checked && idx > -1) {
            // Remove value from array
            localChecked = localChecked.slice(0, idx).concat(localChecked.slice(idx + 1));
          }
        } else {
          localChecked = checked ? value : uncheckedValue;
        }

        this.computedLocalChecked = localChecked; // Change is only emitted on user interaction

        this.$emit('change', checked ? value : uncheckedValue); // If this is a child of form-checkbox-group, we emit a change event on it as well

        if (this.is_Group) {
          this.bvGroup.$emit('change', localChecked);
        }

        this.$emit('update:indeterminate', indeterminate);
      },
      setIndeterminate: function setIndeterminate(state) {
        // Indeterminate only supported in single checkbox mode
        if (isArray$1(this.computedLocalChecked)) {
          state = false;
        }

        if (this.$refs && this.$refs.input) {
          this.$refs.input.indeterminate = state; // Emit update event to prop

          this.$emit('update:indeterminate', state);
        }
      }
    }
  });

  var BFormRadio = Vue.extend({
    name: 'BFormRadio',
    mixins: [idMixin, formRadioCheckMixin, // Includes shared render function
    formMixin, formSizeMixin, formStateMixin],
    inject: {
      bvGroup: {
        from: 'bvRadioGroup',
        default: false
      }
    },
    props: {
      checked: {
        // v-model
        type: [String, Object, Number, Boolean],
        default: null
      }
    },
    computed: {
      // Radio Groups can only have a single value, so determining if checked is simple
      is_Checked: function is_Checked() {
        return looseEqual(this.value, this.computedLocalChecked);
      },
      // Flags for form-radio-check mixin
      is_Radio: function is_Radio() {
        return true;
      },
      is_Check: function is_Check() {
        return false;
      }
    },
    watch: {
      // Radio Groups can only have a single value, so our watchers are simple
      computedLocalChecked: function computedLocalChecked(newVal, oldVal) {
        this.$emit('input', this.computedLocalChecked);
      }
    },
    methods: {
      handleChange: function handleChange(_ref) {
        var checked = _ref.target.checked;
        var value = this.value;
        this.computedLocalChecked = value; // Change is only emitted on user interaction

        this.$emit('change', checked ? value : null); // If this is a child of form-radio-group, we emit a change event on it as well

        if (this.is_Group) {
          this.bvGroup.$emit('change', checked ? value : null);
        }
      }
    }
  });

  var formRadioCheckGroupMixin = {
    model: {
      prop: 'checked',
      event: 'input'
    },
    props: {
      validated: {
        type: Boolean,
        default: false
      },
      ariaInvalid: {
        type: [Boolean, String],
        default: false
      },
      stacked: {
        type: Boolean,
        default: false
      },
      plain: {
        type: Boolean,
        default: false
      },
      buttons: {
        // Render as button style
        type: Boolean,
        default: false
      },
      buttonVariant: {
        // Only applicable when rendered with button style
        type: String,
        default: 'secondary'
      }
    },
    computed: {
      inline: function inline() {
        return !this.stacked;
      },
      groupName: function groupName() {
        // Checks/Radios tied to the same model must have the same name,
        // especially for ARIA accessibility.
        return this.name || this.safeId();
      },
      groupClasses: function groupClasses() {
        if (this.buttons) {
          return ['btn-group-toggle', this.inline ? 'btn-group' : 'btn-group-vertical', this.size ? "btn-group-".concat(this.size) : '', this.validated ? "was-validated" : ''];
        }

        return [this.validated ? "was-validated" : ''];
      },
      computedAriaInvalid: function computedAriaInvalid() {
        var ariaInvalid = this.ariaInvalid;

        if (ariaInvalid === true || ariaInvalid === 'true' || ariaInvalid === '') {
          return 'true';
        }

        return this.computedState === false ? 'true' : null;
      }
    },
    watch: {
      checked: function checked(newVal, oldVal) {
        this.localChecked = newVal;
      },
      localChecked: function localChecked(newVal, oldVal) {
        this.$emit('input', newVal);
      }
    },
    render: function render(h) {
      var _this = this;

      var $slots = this.$slots;
      var inputs = this.formOptions.map(function (option, idx) {
        var uid = "_BV_option_".concat(idx, "_");
        return h(_this.is_RadioGroup ? BFormRadio : BFormCheckbox, {
          key: uid,
          props: {
            id: _this.safeId(uid),
            value: option.value,
            // Individual radios or checks can be disabled in a group
            disabled: option.disabled || false // We don't need to include these, since the input's will know they are inside here
            // name: this.groupName,
            // form: this.form || null,
            // required: Boolean(this.name && this.required)

          }
        }, [h('span', {
          domProps: htmlOrText(option.html, option.text)
        })]);
      });
      return h('div', {
        class: this.groupClasses,
        attrs: {
          id: this.safeId(),
          role: this.is_RadioGroup ? 'radiogroup' : 'group',
          // Tabindex to allow group to be focused if needed
          tabindex: '-1',
          'aria-required': this.required ? 'true' : null,
          'aria-invalid': this.computedAriaInvalid
        }
      }, [$slots.first, inputs, $slots.default]);
    }
  };

  var props$y = {
    switches: {
      // Custom switch styling
      type: Boolean,
      default: false
    },
    checked: {
      type: [String, Number, Object, Array, Boolean],
      default: null
    } // @vue/component

  };
  var BFormCheckboxGroup = Vue.extend({
    name: 'BFormCheckboxGroup',
    mixins: [idMixin, formMixin, formRadioCheckGroupMixin, // Includes render function
    formOptionsMixin, formSizeMixin, formStateMixin],
    provide: function provide() {
      return {
        bvCheckGroup: this
      };
    },
    props: props$y,
    data: function data() {
      return {
        localChecked: this.checked || []
      };
    },
    computed: {
      is_RadioGroup: function is_RadioGroup() {
        return false;
      }
    }
  });

  var components$f = {
    BFormCheckbox: BFormCheckbox,
    BCheckbox: BFormCheckbox,
    BCheck: BFormCheckbox,
    BFormCheckboxGroup: BFormCheckboxGroup,
    BCheckboxGroup: BFormCheckboxGroup,
    BCheckGroup: BFormCheckboxGroup
  };
  var index$d = {
    install: installFactory({
      components: components$f
    })
  };

  var props$z = {
    checked: {
      type: [String, Object, Number, Boolean],
      default: null
    } // @vue/component

  };
  var BFormRadioGroup = Vue.extend({
    name: 'BFormRadioGroup',
    mixins: [idMixin, formMixin, formRadioCheckGroupMixin, // Includes render function
    formOptionsMixin, formSizeMixin, formStateMixin],
    provide: function provide() {
      return {
        bvRadioGroup: this
      };
    },
    props: props$z,
    data: function data() {
      return {
        localChecked: this.checked
      };
    },
    computed: {
      is_RadioGroup: function is_RadioGroup() {
        return true;
      }
    }
  });

  var components$g = {
    BFormRadio: BFormRadio,
    BRadio: BFormRadio,
    BFormRadioGroup: BFormRadioGroup,
    BRadioGroup: BFormRadioGroup
  };
  var index$e = {
    install: installFactory({
      components: components$g
    })
  };

  var formTextMixin = {
    model: {
      prop: 'value',
      event: 'update'
    },
    props: {
      value: {
        type: [String, Number],
        default: ''
      },
      ariaInvalid: {
        type: [Boolean, String],
        default: false
      },
      readonly: {
        type: Boolean,
        default: false
      },
      plaintext: {
        type: Boolean,
        default: false
      },
      autocomplete: {
        type: String,
        default: null
      },
      placeholder: {
        type: String,
        default: null
      },
      formatter: {
        type: Function,
        default: null
      },
      trim: {
        type: Boolean,
        default: false
      },
      number: {
        type: Boolean,
        default: false
      },
      lazyFormatter: {
        type: Boolean,
        value: false
      }
    },
    data: function data() {
      return {
        localValue: this.stringifyValue(this.value)
      };
    },
    computed: {
      computedClass: function computedClass() {
        return [{
          // Range input needs class custom-range
          'custom-range': this.type === 'range',
          // plaintext not supported by type=range or type=color
          'form-control-plaintext': this.plaintext && this.type !== 'range' && this.type !== 'color',
          // form-control not used by type=range or plaintext. Always used by type=color
          'form-control': !this.plaintext && this.type !== 'range' || this.type === 'color'
        }, this.sizeFormClass, this.stateClass];
      },
      computedAriaInvalid: function computedAriaInvalid() {
        if (!this.ariaInvalid || this.ariaInvalid === 'false') {
          // this.ariaInvalid is null or false or 'false'
          return this.computedState === false ? 'true' : null;
        }

        if (this.ariaInvalid === true) {
          // User wants explicit aria-invalid=true
          return 'true';
        } // Most likely a string value (which could be the string 'true')


        return this.ariaInvalid;
      }
    },
    watch: {
      value: function value(newVal, oldVal) {
        if (newVal !== oldVal && newVal !== this.localValue) {
          this.localValue = this.stringifyValue(newVal);
        }
      }
    },
    mounted: function mounted() {
      var value = this.stringifyValue(this.value);

      if (value !== this.localValue) {
        /* istanbul ignore next */
        this.localValue = value;
      }
    },
    methods: {
      stringifyValue: function stringifyValue(value) {
        return isUndefined(value) || isNull(value) ? '' : String(value);
      },
      getFormatted: function getFormatted(value, event) {
        var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        value = this.stringifyValue(value);

        if ((!this.lazyFormatter || force) && isFunction(this.formatter)) {
          value = this.formatter(value, event);
        }

        return value;
      },
      updateValue: function updateValue(value) {
        value = this.stringifyValue(value);

        if (this.localValue !== value) {
          // keep the input set to the value before modifiers
          this.localValue = value;

          if (this.number) {
            // Emulate .number modifier behaviour
            var num = parseFloat(value);
            value = isNaN(num) ? value : num;
          } else if (this.trim) {
            // Emulate .trim modifier behaviour
            value = value.trim();
          } // Update the v-model


          this.$emit('update', value);
        }
      },
      onInput: function onInput(evt) {
        // evt.target.composing is set by Vue
        // https://github.com/vuejs/vue/blob/dev/src/platforms/web/runtime/directives/model.js

        /* istanbul ignore if: hard to test composition events */
        if (evt.target.composing) {
          return;
        }

        var formatted = this.getFormatted(evt.target.value, evt);

        if (formatted === false || evt.defaultPrevented) {
          evt.preventDefault();
          return;
        }

        this.updateValue(formatted);
        this.$emit('input', formatted);
      },
      onChange: function onChange(evt) {
        // evt.target.composing is set by Vue
        // https://github.com/vuejs/vue/blob/dev/src/platforms/web/runtime/directives/model.js

        /* istanbul ignore if: hard to test composition events */
        if (evt.target.composing) {
          return;
        }

        var formatted = this.getFormatted(evt.target.value, evt);

        if (formatted === false) {
          return;
        }

        this.updateValue(formatted);
        this.$emit('change', formatted);
      },
      onBlur: function onBlur(evt) {
        // lazy formatter
        if (this.lazyFormatter) {
          var formatted = this.getFormatted(evt.target.value, evt, true);

          if (formatted === false) {
            return;
          }

          this.updateValue(formatted);
        } // Emit native blur event


        this.$emit('blur', evt);
      },
      focus: function focus() {
        // For external handler that may want a focus method
        if (!this.disabled) {
          this.$el.focus();
        }
      },
      blur: function blur() {
        // For external handler that may want a blur method
        if (!this.disabled) {
          this.$el.blur();
        }
      }
    }
  };

  // @vue/component
  var formSelectionMixin = {
    computed: {
      selectionStart: {
        // Expose selectionStart for formatters, etc
        cache: false,
        get: function get()
        /* istanbul ignore next */
        {
          return this.$refs.input.selectionStart;
        },
        set: function set(val)
        /* istanbul ignore next */
        {
          this.$refs.input.selectionStart = val;
        }
      },
      selectionEnd: {
        // Expose selectionEnd for formatters, etc
        cache: false,
        get: function get()
        /* istanbul ignore next */
        {
          return this.$refs.input.selectionEnd;
        },
        set: function set(val)
        /* istanbul ignore next */
        {
          this.$refs.input.selectionEnd = val;
        }
      },
      selectionDirection: {
        // Expose selectionDirection for formatters, etc
        cache: false,
        get: function get()
        /* istanbul ignore next */
        {
          return this.$refs.input.selectionDirection;
        },
        set: function set(val)
        /* istanbul ignore next */
        {
          this.$refs.input.selectionDirection = val;
        }
      }
    },
    methods: {
      select: function select()
      /* istanbul ignore next */
      {
        var _this$$refs$input;

        // For external handler that may want a select() method
        (_this$$refs$input = this.$refs.input).select.apply(_this$$refs$input, arguments);
      },
      setSelectionRange: function setSelectionRange()
      /* istanbul ignore next */
      {
        var _this$$refs$input2;

        // For external handler that may want a setSelectionRange(a,b,c) method
        (_this$$refs$input2 = this.$refs.input).setSelectionRange.apply(_this$$refs$input2, arguments);
      },
      setRangeText: function setRangeText()
      /* istanbul ignore next */
      {
        var _this$$refs$input3;

        // For external handler that may want a setRangeText(a,b,c) method
        (_this$$refs$input3 = this.$refs.input).setRangeText.apply(_this$$refs$input3, arguments);
      }
    }
  };

  // @vue/component
  var formValidityMixin = {
    computed: {
      validity: {
        // Expose validity property
        cache: false,
        get: function get()
        /* istanbul ignore next */
        {
          return this.$refs.input.validity;
        }
      },
      validationMessage: {
        // Expose validationMessage property
        cache: false,
        get: function get()
        /* istanbul ignore next */
        {
          return this.$refs.input.validationMessage;
        }
      },
      willValidate: {
        // Expose willValidate property
        cache: false,
        get: function get()
        /* istanbul ignore next */
        {
          return this.$refs.input.willValidate;
        }
      }
    },
    methods: {
      setCustomValidity: function setCustomValidity()
      /* istanbul ignore next */
      {
        var _this$$refs$input;

        // For external handler that may want a setCustomValidity(...) method
        return (_this$$refs$input = this.$refs.input).setCustomValidity.apply(_this$$refs$input, arguments);
      },
      checkValidity: function checkValidity()
      /* istanbul ignore next */
      {
        var _this$$refs$input2;

        // For external handler that may want a checkValidity(...) method
        return (_this$$refs$input2 = this.$refs.input).checkValidity.apply(_this$$refs$input2, arguments);
      },
      reportValidity: function reportValidity()
      /* istanbul ignore next */
      {
        var _this$$refs$input3;

        // For external handler that may want a reportValidity(...) method
        return (_this$$refs$input3 = this.$refs.input).reportValidity.apply(_this$$refs$input3, arguments);
      }
    }
  };

  var TYPES = ['text', 'password', 'email', 'number', 'url', 'tel', 'search', 'range', 'color', 'date', 'time', 'datetime', 'datetime-local', 'month', 'week']; // @vue/component

  var BFormInput = Vue.extend({
    name: 'BFormInput',
    mixins: [idMixin, formMixin, formSizeMixin, formStateMixin, formTextMixin, formSelectionMixin, formValidityMixin],
    props: {
      // value prop defined in form-text mixin
      // value: { },
      type: {
        type: String,
        default: 'text',
        validator: function validator(type) {
          return arrayIncludes(TYPES, type);
        }
      },
      noWheel: {
        // Disable mousewheel to prevent wheel from changing values (i.e. number/date).
        type: Boolean,
        default: false
      },
      min: {
        type: [String, Number],
        default: null
      },
      max: {
        type: [String, Number],
        default: null
      },
      step: {
        type: [String, Number],
        default: null
      },
      list: {
        type: String,
        default: null
      }
    },
    computed: {
      localType: function localType() {
        // We only allow certain types
        return arrayIncludes(TYPES, this.type) ? this.type : 'text';
      }
    },
    watch: {
      noWheel: function noWheel(newVal) {
        this.setWheelStopper(newVal);
      }
    },
    mounted: function mounted() {
      this.setWheelStopper(this.noWheel);
    },
    deactivated: function deactivated() {
      // Turn off listeners when keep-alive component deactivated

      /* istanbul ignore next */
      this.setWheelStopper(false);
    },
    activated: function activated() {
      // Turn on listeners (if no-wheel) when keep-alive component activated

      /* istanbul ignore next */
      this.setWheelStopper(this.noWheel);
    },
    beforeDestroy: function beforeDestroy() {
      /* istanbul ignore next */
      this.setWheelStopper(false);
    },
    methods: {
      setWheelStopper: function setWheelStopper(on) {
        var input = this.$el; // We use native events, so that we don't interfere with propgation

        if (on) {
          eventOn(input, 'focus', this.onWheelFocus);
          eventOn(input, 'blur', this.onWheelBlur);
        } else {
          eventOff(input, 'focus', this.onWheelFocus);
          eventOff(input, 'blur', this.onWheelBlur);
          eventOff(document, 'wheel', this.stopWheel);
        }
      },
      onWheelFocus: function onWheelFocus(evt) {
        eventOn(document, 'wheel', this.stopWheel);
      },
      onWheelBlur: function onWheelBlur(evt) {
        eventOff(document, 'wheel', this.stopWheel);
      },
      stopWheel: function stopWheel(evt) {
        evt.preventDefault();
        this.$el.blur();
      }
    },
    render: function render(h) {
      var self = this;
      return h('input', {
        ref: 'input',
        class: self.computedClass,
        directives: [{
          name: 'model',
          rawName: 'v-model',
          value: self.localValue,
          expression: 'localValue'
        }],
        attrs: {
          id: self.safeId(),
          name: self.name,
          form: self.form || null,
          type: self.localType,
          disabled: self.disabled,
          placeholder: self.placeholder,
          required: self.required,
          autocomplete: self.autocomplete || null,
          readonly: self.readonly || self.plaintext,
          min: self.min,
          max: self.max,
          step: self.step,
          list: self.localType !== 'password' ? self.list : null,
          'aria-required': self.required ? 'true' : null,
          'aria-invalid': self.computedAriaInvalid
        },
        domProps: {
          value: self.localValue
        },
        on: _objectSpread({}, self.$listeners, {
          input: self.onInput,
          change: self.onChange,
          blur: self.onBlur
        })
      });
    }
  });

  var components$h = {
    BFormInput: BFormInput,
    BInput: BFormInput
  };
  var index$f = {
    install: installFactory({
      components: components$h
    })
  };

  var BFormTextarea = Vue.extend({
    name: 'BFormTextarea',
    mixins: [idMixin, formMixin, formSizeMixin, formStateMixin, formTextMixin, formSelectionMixin, formValidityMixin],
    props: {
      rows: {
        type: [Number, String],
        default: 2
      },
      maxRows: {
        type: [Number, String],
        default: null
      },
      wrap: {
        // 'soft', 'hard' or 'off'. Browser default is 'soft'
        type: String,
        default: 'soft'
      },
      noResize: {
        // Disable the resize handle of textarea
        type: Boolean,
        default: false
      },
      noAutoShrink: {
        // When in auto resize mode, disable shrinking to content height
        type: Boolean,
        default: false
      }
    },
    data: function data() {
      return {
        dontResize: true,
        heightInPx: null
      };
    },
    computed: {
      computedStyle: function computedStyle() {
        var styles = {
          // Setting `noResize` to true will disable the ability for the user to
          // manually resize the textarea. We also disable when in auto resize mode
          resize: !this.computedRows || this.noResize ? 'none' : null
        };

        if (!this.computedRows) {
          // The computed height for auto resize.
          // We avoid setting the style to null, which can override user manual resize.
          styles.height = this.heightInPx; // We always add a vertical scrollbar to the textarea when auto-resize is
          // enabled so that the computed height calcaultion returns a stable value.

          styles.overflowY = 'scroll';
        }

        return styles;
      },
      computedMinRows: function computedMinRows() {
        // Ensure rows is at least 2 and positive (2 is the native textarea value).
        // A value of 1 can cause issues in some browsers, and most browsers only support
        // 2 as the smallest value.
        return Math.max(parseInt(this.rows, 10) || 2, 2);
      },
      computedMaxRows: function computedMaxRows() {
        return Math.max(this.computedMinRows, parseInt(this.maxRows, 10) || 0);
      },
      computedRows: function computedRows() {
        // This is used to set the attribute 'rows' on the textarea.
        // If auto-resize is enabled, then we return null as we use CSS to control height.
        return this.computedMinRows === this.computedMaxRows ? this.computedMinRows : null;
      }
    },
    watch: {
      dontResize: function dontResize(newVal, oldval) {
        if (!newVal) {
          this.setHeight();
        }
      },
      localValue: function localValue(newVal, oldVal) {
        this.setHeight();
      }
    },
    mounted: function mounted() {
      var _this = this;

      // Enable opt-in resizing once mounted
      this.$nextTick(function () {
        _this.dontResize = false;
      });
    },
    activated: function activated() {
      var _this2 = this;

      // If we are being re-activated in <keep-alive>, enable opt-in resizing
      this.$nextTick(function () {
        _this2.dontResize = false;
      });
    },
    deactivated: function deactivated() {
      // If we are in a deactivated <keep-alive>, disable opt-in resizing
      this.dontResize = true;
    },
    beforeDestroy: function beforeDestroy() {
      /* istanbul ignore next */
      this.dontResize = true;
    },
    methods: {
      setHeight: function setHeight() {
        var _this3 = this;

        this.$nextTick(function () {
          _this3.heightInPx = _this3.computeHeight();
        });
      },
      computeHeight: function computeHeight()
      /* istanbul ignore next: can't test getComputedStyle in JSDOM */
      {
        if (this.$isServer || !isNull(this.computedRows)) {
          return null;
        }

        var el = this.$el; // Element must be visible (not hidden) and in document.
        // Must be checked after above checks

        if (!isVisible(el)) {
          return null;
        } // Get current computed styles


        var computedStyle = getCS(el); // Height of one line of text in px

        var lineHeight = parseFloat(computedStyle.lineHeight); // Calculate height of border and padding

        var border = (parseFloat(computedStyle.borderTopWidth) || 0) + (parseFloat(computedStyle.borderBottomWidth) || 0);
        var padding = (parseFloat(computedStyle.paddingTop) || 0) + (parseFloat(computedStyle.paddingBottom) || 0); // Calculate offset

        var offset = border + padding; // Minimum height for min rows (which must be 2 rows or greater for cross-browser support)

        var minHeight = lineHeight * this.computedMinRows + offset; // Get the current style height (with `px` units)

        var oldHeight = el.style.height || computedStyle.height; // Probe scrollHeight by temporarily changing the height to `auto`

        el.style.height = 'auto';
        var scrollHeight = el.scrollHeight; // Place the original old height back on the element, just in case this computedProp
        // returns the same value as before.

        el.style.height = oldHeight; // Calculate content height in "rows" (scrollHeight includes padding but not border)

        var contentRows = Math.max((scrollHeight - padding) / lineHeight, 2); // Calculate number of rows to display (limited within min/max rows)

        var rows = Math.min(Math.max(contentRows, this.computedMinRows), this.computedMaxRows); // Calculate the required height of the textarea including border and padding (in pixels)

        var height = Math.max(Math.ceil(rows * lineHeight + offset), minHeight); // Computed height remains the larger of oldHeight and new height,
        // when height is in `sticky` mode (prop `no-auto-shrink` is true)

        if (this.noAutoShrink && (parseFloat(oldHeight) || 0) > height) {
          return oldHeight;
        } // Return the new computed CSS height in px units


        return "".concat(height, "px");
      }
    },
    render: function render(h) {
      // Using self instead of this helps reduce code size during minification
      var self = this;
      return h('textarea', {
        ref: 'input',
        class: self.computedClass,
        style: self.computedStyle,
        directives: [{
          name: 'model',
          rawName: 'v-model',
          value: self.localValue,
          expression: 'localValue'
        }],
        attrs: {
          id: self.safeId(),
          name: self.name,
          form: self.form || null,
          disabled: self.disabled,
          placeholder: self.placeholder,
          required: self.required,
          autocomplete: self.autocomplete || null,
          readonly: self.readonly || self.plaintext,
          rows: self.computedRows,
          wrap: self.wrap || null,
          'aria-required': self.required ? 'true' : null,
          'aria-invalid': self.computedAriaInvalid
        },
        domProps: {
          value: self.localValue
        },
        on: _objectSpread({}, self.$listeners, {
          input: self.onInput,
          change: self.onChange,
          blur: self.onBlur
        })
      });
    }
  });

  var components$i = {
    BFormTextarea: BFormTextarea,
    BTextarea: BFormTextarea
  };
  var index$g = {
    install: installFactory({
      components: components$i
    })
  };

  // @vue/component
  var formCustomMixin = {
    props: {
      plain: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      custom: function custom() {
        return !this.plain;
      }
    }
  };

  /**
   * Returns vNodes for named slot either scoped or unscoped
   *
   * @param {String} name
   * @param {String} scope
   * @param {Object} scopedSlots
   * @param {Object} slots
   * @returns {Array|undefined} vNodes
   */

  var normalizeSlot = function normalizeSlot(name) {
    var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var $scopedSlots = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var $slots = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    // Note: in Vue 2.6.x, all names slots are also scoped slots
    var slot = $scopedSlots[name] || $slots[name];
    return isFunction(slot) ? slot(scope) : slot;
  };

  var normalizeSlotMixin = {
    methods: {
      hasNormalizedSlot: function hasNormalizedSlot(name) {
        // Returns true if the either a $scopedSlot or $slot exists with the specified name
        return Boolean(this.$scopedSlots[name] || this.$slots[name]);
      },
      normalizeSlot: function normalizeSlot$1(name) {
        var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        // Returns an array of rendered vNodes if slot found.
        // Returns undefined if not found.
        var vNodes = normalizeSlot(name, scope, this.$scopedSlots, this.$slots);

        return vNodes ? concat(vNodes) : vNodes;
      }
    }
  };

  var NAME$b = 'BFormFile'; // @vue/component

  var BFormFile = Vue.extend({
    name: NAME$b,
    mixins: [idMixin, formMixin, formStateMixin, formCustomMixin, normalizeSlotMixin],
    model: {
      prop: 'value',
      event: 'input'
    },
    props: {
      value: {
        // type: Object,
        default: null
      },
      accept: {
        type: String,
        default: ''
      },
      // Instruct input to capture from camera
      capture: {
        type: Boolean,
        default: false
      },
      placeholder: {
        type: String,
        default: function _default() {
          return String(getComponentConfig(NAME$b, 'placeholder') || '');
        }
      },
      browseText: {
        type: String,
        default: function _default() {
          return String(getComponentConfig(NAME$b, 'browseText') || '');
        }
      },
      dropPlaceholder: {
        type: String,
        default: function _default() {
          return String(getComponentConfig(NAME$b, 'dropPlaceholder') || '');
        }
      },
      multiple: {
        type: Boolean,
        default: false
      },
      directory: {
        type: Boolean,
        default: false
      },
      noTraverse: {
        type: Boolean,
        default: false
      },
      noDrop: {
        type: Boolean,
        default: false
      },
      fileNameFormatter: {
        type: Function,
        default: null
      }
    },
    data: function data() {
      return {
        selectedFile: null,
        dragging: false,
        hasFocus: false
      };
    },
    computed: {
      selectLabel: function selectLabel() {
        // Draging active
        if (this.dragging && this.dropPlaceholder) {
          return this.dropPlaceholder;
        } // No file chosen


        if (!this.selectedFile || this.selectedFile.length === 0) {
          return this.placeholder;
        } // Convert selectedFile to an array (if not already one)


        var files = concat(this.selectedFile).filter(Boolean);

        if (this.hasNormalizedSlot('file-name')) {
          // There is a slot for formatting the files/names
          return [this.normalizeSlot('file-name', {
            files: files,
            names: files.map(function (f) {
              return f.name;
            })
          })];
        } else {
          // Use the user supplied formatter, or the built in one.
          return isFunction(this.fileNameFormatter) ? String(this.fileNameFormatter(files)) : files.map(function (file) {
            return file.name;
          }).join(', ');
        }
      }
    },
    watch: {
      selectedFile: function selectedFile(newVal, oldVal) {
        // The following test is needed when the file input is "reset" or the
        // exact same file(s) are selected to prevent an infinite loop.
        // When in `multiple` mode we need to check for two empty arrays or
        // two arrays with identical files
        if (newVal === oldVal || isArray$1(newVal) && isArray$1(oldVal) && newVal.length === oldVal.length && newVal.every(function (v, i) {
          return v === oldVal[i];
        })) {
          return;
        }

        if (!newVal && this.multiple) {
          this.$emit('input', []);
        } else {
          this.$emit('input', newVal);
        }
      },
      value: function value(newVal) {
        if (!newVal || isArray$1(newVal) && newVal.length === 0) {
          this.reset();
        }
      }
    },
    methods: {
      focusHandler: function focusHandler(evt) {
        // Bootstrap v4 doesn't have focus styling for custom file input
        // Firefox has a '[type=file]:focus ~ sibling' selector issue,
        // so we add a 'focus' class to get around these bugs
        if (this.plain || evt.type === 'focusout') {
          this.hasFocus = false;
        } else {
          // Add focus styling for custom file input
          this.hasFocus = true;
        }
      },
      reset: function reset() {
        try {
          // Wrapped in try in case IE 11 craps out
          this.$refs.input.value = '';
        } catch (e) {} // IE 11 doesn't support setting `input.value` to '' or null
        // So we use this little extra hack to reset the value, just in case.
        // This also appears to work on modern browsers as well.


        this.$refs.input.type = '';
        this.$refs.input.type = 'file';
        this.selectedFile = this.multiple ? [] : null;
      },
      onFileChange: function onFileChange(evt) {
        var _this = this;

        // Always emit original event
        this.$emit('change', evt); // Check if special `items` prop is available on event (drop mode)
        // Can be disabled by setting no-traverse

        var items = evt.dataTransfer && evt.dataTransfer.items;
        /* istanbul ignore next: not supported in JSDOM */

        if (items && !this.noTraverse) {
          var queue = [];

          for (var i = 0; i < items.length; i++) {
            var item = items[i].webkitGetAsEntry();

            if (item) {
              queue.push(this.traverseFileTree(item));
            }
          }

          Promise.all(queue).then(function (filesArr) {
            _this.setFiles(from(filesArr));
          });
          return;
        } // Normal handling


        this.setFiles(evt.target.files || evt.dataTransfer.files);
      },
      setFiles: function setFiles() {
        var files = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        if (!files) {
          /* istanbul ignore next: this will probably not happen */
          this.selectedFile = null;
        } else if (this.multiple) {
          // Convert files to array
          var filesArray = [];

          for (var i = 0; i < files.length; i++) {
            filesArray.push(files[i]);
          } // Return file(s) as array


          this.selectedFile = filesArray;
        } else {
          // Return single file object
          this.selectedFile = files[0] || null;
        }
      },
      onReset: function onReset() {
        // Triggered when the parent form (if any) is reset
        this.selectedFile = this.multiple ? [] : null;
      },
      onDragover: function onDragover(evt)
      /* istanbul ignore next: difficult to test in JSDOM */
      {
        evt.preventDefault();
        evt.stopPropagation();

        if (this.noDrop || !this.custom) {
          return;
        }

        this.dragging = true;
        evt.dataTransfer.dropEffect = 'copy';
      },
      onDragleave: function onDragleave(evt)
      /* istanbul ignore next: difficult to test in JSDOM */
      {
        evt.preventDefault();
        evt.stopPropagation();
        this.dragging = false;
      },
      onDrop: function onDrop(evt)
      /* istanbul ignore next: difficult to test in JSDOM */
      {
        evt.preventDefault();
        evt.stopPropagation();

        if (this.noDrop) {
          return;
        }

        this.dragging = false;

        if (evt.dataTransfer.files && evt.dataTransfer.files.length > 0) {
          this.onFileChange(evt);
        }
      },
      traverseFileTree: function traverseFileTree(item, path)
      /* istanbul ignore next: not supported in JSDOM */
      {
        var _this2 = this;

        // Based on http://stackoverflow.com/questions/3590058
        return new Promise(function (resolve) {
          path = path || '';

          if (item.isFile) {
            // Get file
            item.file(function (file) {
              file.$path = path; // Inject $path to file obj

              resolve(file);
            });
          } else if (item.isDirectory) {
            // Get folder contents
            item.createReader().readEntries(function (entries) {
              var queue = [];

              for (var i = 0; i < entries.length; i++) {
                queue.push(_this2.traverseFileTree(entries[i], path + item.name + '/'));
              }

              Promise.all(queue).then(function (filesArr) {
                resolve(from(filesArr));
              });
            });
          }
        });
      }
    },
    render: function render(h) {
      // Form Input
      var input = h('input', {
        ref: 'input',
        class: [{
          'form-control-file': this.plain,
          'custom-file-input': this.custom,
          focus: this.custom && this.hasFocus
        }, this.stateClass],
        attrs: {
          type: 'file',
          id: this.safeId(),
          name: this.name,
          disabled: this.disabled,
          required: this.required,
          form: this.form || null,
          capture: this.capture || null,
          accept: this.accept || null,
          multiple: this.multiple,
          webkitdirectory: this.directory,
          'aria-required': this.required ? 'true' : null
        },
        on: {
          change: this.onFileChange,
          focusin: this.focusHandler,
          focusout: this.focusHandler,
          reset: this.onReset
        }
      });

      if (this.plain) {
        return input;
      } // Overlay Labels


      var label = h('label', {
        staticClass: 'custom-file-label',
        class: [this.dragging ? 'dragging' : null],
        attrs: {
          for: this.safeId(),
          'data-browse': this.browseText || null
        }
      }, this.selectLabel); // Return rendered custom file input

      return h('div', {
        staticClass: 'custom-file b-form-file',
        class: this.stateClass,
        attrs: {
          id: this.safeId('_BV_file_outer_')
        },
        on: {
          dragover: this.onDragover,
          dragleave: this.onDragleave,
          drop: this.onDrop
        }
      }, [input, label]);
    }
  });

  var components$j = {
    BFormFile: BFormFile,
    BFile: BFormFile
  };
  var index$h = {
    install: installFactory({
      components: components$j
    })
  };

  var BFormSelect = Vue.extend({
    name: 'BFormSelect',
    mixins: [idMixin, formMixin, formSizeMixin, formStateMixin, formCustomMixin, formOptionsMixin],
    model: {
      prop: 'value',
      event: 'input'
    },
    props: {
      value: {// type: [Object, Array, String, Number, Boolean],
        // default: undefined
      },
      multiple: {
        type: Boolean,
        default: false
      },
      selectSize: {
        // Browsers default size to 0, which shows 4 rows in most browsers in multiple mode
        // Size of 1 can bork out Firefox
        type: Number,
        default: 0
      },
      ariaInvalid: {
        type: [Boolean, String],
        default: false
      }
    },
    data: function data() {
      return {
        localValue: this.value
      };
    },
    computed: {
      computedSelectSize: function computedSelectSize() {
        // Custom selects with a size of zero causes the arrows to be hidden,
        // so dont render the size attribute in this case
        return !this.plain && this.selectSize === 0 ? null : this.selectSize;
      },
      inputClass: function inputClass() {
        return [this.plain ? 'form-control' : 'custom-select', this.size && this.plain ? "form-control-".concat(this.size) : null, this.size && !this.plain ? "custom-select-".concat(this.size) : null, this.stateClass];
      },
      computedAriaInvalid: function computedAriaInvalid() {
        if (this.ariaInvalid === true || this.ariaInvalid === 'true') {
          return 'true';
        }

        return this.stateClass === 'is-invalid' ? 'true' : null;
      }
    },
    watch: {
      value: function value(newVal, oldVal) {
        this.localValue = newVal;
      },
      localValue: function localValue(newVal, oldVal) {
        this.$emit('input', this.localValue);
      }
    },
    methods: {
      focus: function focus() {
        this.$refs.input.focus();
      },
      blur: function blur() {
        this.$refs.input.blur();
      }
    },
    render: function render(h) {
      var _this = this;

      var $slots = this.$slots;
      var options = this.formOptions.map(function (option, index) {
        return h('option', {
          key: "option_".concat(index, "_opt"),
          attrs: {
            disabled: Boolean(option.disabled)
          },
          domProps: _objectSpread({}, htmlOrText(option.html, option.text), {
            value: option.value
          })
        });
      });
      return h('select', {
        ref: 'input',
        class: this.inputClass,
        directives: [{
          name: 'model',
          rawName: 'v-model',
          value: this.localValue,
          expression: 'localValue'
        }],
        attrs: {
          id: this.safeId(),
          name: this.name,
          form: this.form || null,
          multiple: this.multiple || null,
          size: this.computedSelectSize,
          disabled: this.disabled,
          required: this.required,
          'aria-required': this.required ? 'true' : null,
          'aria-invalid': this.computedAriaInvalid
        },
        on: {
          change: function change(evt) {
            var target = evt.target;
            var selectedVal = from(target.options).filter(function (o) {
              return o.selected;
            }).map(function (o) {
              return '_value' in o ? o._value : o.value;
            });
            _this.localValue = target.multiple ? selectedVal : selectedVal[0];

            _this.$nextTick(function () {
              _this.$emit('change', _this.localValue);
            });
          }
        }
      }, [$slots.first, options, $slots.default]);
    }
  });

  var components$k = {
    BFormSelect: BFormSelect,
    BSelect: BFormSelect
  };
  var index$i = {
    install: installFactory({
      components: components$k
    })
  };

  var components$l = {
    BImg: BImg,
    BImgLazy: BImgLazy
  };
  var index$j = {
    install: installFactory({
      components: components$l
    })
  };

  var props$A = {
    fluid: {
      type: Boolean,
      default: false
    },
    containerFluid: {
      type: Boolean,
      default: false
    },
    header: {
      type: String,
      default: null
    },
    headerHtml: {
      type: String,
      default: null
    },
    headerTag: {
      type: String,
      default: 'h1'
    },
    headerLevel: {
      type: [Number, String],
      default: '3'
    },
    lead: {
      type: String,
      default: null
    },
    leadHtml: {
      type: String,
      default: null
    },
    leadTag: {
      type: String,
      default: 'p'
    },
    tag: {
      type: String,
      default: 'div'
    },
    bgVariant: {
      type: String,
      default: null
    },
    borderVariant: {
      type: String,
      default: null
    },
    textVariant: {
      type: String,
      default: null
    } // @vue/component

  };
  var BJumbotron = Vue.extend({
    name: 'BJumbotron',
    functional: true,
    props: props$A,
    render: function render(h, _ref) {
      var _class2;

      var props = _ref.props,
          data = _ref.data,
          slots = _ref.slots;
      // The order of the conditionals matter.
      // We are building the component markup in order.
      var childNodes = [];
      var $slots = slots(); // Header

      if (props.header || $slots.header || props.headerHtml) {
        childNodes.push(h(props.headerTag, {
          class: _defineProperty({}, "display-".concat(props.headerLevel), Boolean(props.headerLevel))
        }, $slots.header || props.headerHtml || stripTags(props.header)));
      } // Lead


      if (props.lead || $slots.lead || props.leadHtml) {
        childNodes.push(h(props.leadTag, {
          staticClass: 'lead'
        }, $slots.lead || props.leadHtml || stripTags(props.lead)));
      } // Default slot


      if ($slots.default) {
        childNodes.push($slots.default);
      } // If fluid, wrap content in a container/container-fluid


      if (props.fluid) {
        // Children become a child of a container
        childNodes = [h(Container, {
          props: {
            fluid: props.containerFluid
          }
        }, childNodes)];
      } // Return the jumbotron


      return h(props.tag, mergeData(data, {
        staticClass: 'jumbotron',
        class: (_class2 = {
          'jumbotron-fluid': props.fluid
        }, _defineProperty(_class2, "text-".concat(props.textVariant), Boolean(props.textVariant)), _defineProperty(_class2, "bg-".concat(props.bgVariant), Boolean(props.bgVariant)), _defineProperty(_class2, "border-".concat(props.borderVariant), Boolean(props.borderVariant)), _defineProperty(_class2, "border", Boolean(props.borderVariant)), _class2)
      }), childNodes);
    }
  });

  var components$m = {
    BJumbotron: BJumbotron
  };
  var index$k = {
    install: installFactory({
      components: components$m
    })
  };

  var components$n = {
    BLink: BLink
  };
  var index$l = {
    install: installFactory({
      components: components$n
    })
  };

  var props$B = {
    tag: {
      type: String,
      default: 'div'
    },
    flush: {
      type: Boolean,
      default: false
    },
    horizontal: {
      type: [Boolean, String],
      default: false
    } // @vue/component

  };
  var BListGroup = Vue.extend({
    name: 'BListGroup',
    functional: true,
    props: props$B,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      var horizontal = props.horizontal === '' ? true : props.horizontal;
      horizontal = props.flush ? false : horizontal;
      var componentData = {
        staticClass: 'list-group',
        class: _defineProperty({
          'list-group-flush': props.flush,
          'list-group-horizontal': horizontal === true
        }, "list-group-horizontal-".concat(horizontal), isString(horizontal))
      };
      return h(props.tag, mergeData(data, componentData), children);
    }
  });

  var actionTags = ['a', 'router-link', 'button', 'b-link'];
  var linkProps$2 = propsFactory();
  delete linkProps$2.href.default;
  delete linkProps$2.to.default;
  var props$C = _objectSpread({
    tag: {
      type: String,
      default: 'div'
    },
    action: {
      type: Boolean,
      default: null
    },
    button: {
      type: Boolean,
      default: null
    },
    variant: {
      type: String,
      default: null
    }
  }, linkProps$2); // @vue/component

  var BListGroupItem = Vue.extend({
    name: 'BListGroupItem',
    functional: true,
    props: props$C,
    render: function render(h, _ref) {
      var _class;

      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      var tag = props.button ? 'button' : !props.href && !props.to ? props.tag : BLink;
      var isAction = Boolean(props.href || props.to || props.action || props.button || arrayIncludes(actionTags, props.tag));
      var attrs = {};
      var itemProps = {};

      if (tag === 'button') {
        if (!data.attrs || !data.attrs.type) {
          // Add a type for button is one not provided in passed attributes
          attrs.type = 'button';
        }

        if (props.disabled) {
          // Set disabled attribute if button and disabled
          attrs.disabled = true;
        }
      } else {
        itemProps = pluckProps(linkProps$2, props);
      }

      var componentData = {
        attrs: attrs,
        props: itemProps,
        staticClass: 'list-group-item',
        class: (_class = {}, _defineProperty(_class, "list-group-item-".concat(props.variant), Boolean(props.variant)), _defineProperty(_class, 'list-group-item-action', isAction), _defineProperty(_class, "active", props.active), _defineProperty(_class, "disabled", props.disabled), _class)
      };
      return h(tag, mergeData(data, componentData), children);
    }
  });

  var components$o = {
    BListGroup: BListGroup,
    BListGroupItem: BListGroupItem
  };
  var index$m = {
    install: installFactory({
      components: components$o
    })
  };

  var props$D = {
    tag: {
      type: String,
      default: 'div'
    }
  };
  var BMediaBody = Vue.extend({
    name: 'BMediaBody',
    functional: true,
    props: props$D,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.tag, mergeData(data, {
        staticClass: 'media-body'
      }), children);
    }
  });

  var props$E = {
    tag: {
      type: String,
      default: 'div'
    },
    verticalAlign: {
      type: String,
      default: 'top'
    } // @vue/component

  };
  var BMediaAside = Vue.extend({
    name: 'BMediaAside',
    functional: true,
    props: props$E,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.tag, mergeData(data, {
        staticClass: 'd-flex',
        class: _defineProperty({}, "align-self-".concat(props.verticalAlign), props.verticalAlign)
      }), children);
    }
  });

  var props$F = {
    tag: {
      type: String,
      default: 'div'
    },
    rightAlign: {
      type: Boolean,
      default: false
    },
    verticalAlign: {
      type: String,
      default: 'top'
    },
    noBody: {
      type: Boolean,
      default: false
    } // @vue/component

  };
  var BMedia = Vue.extend({
    name: 'BMedia',
    functional: true,
    props: props$F,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          slots = _ref.slots,
          children = _ref.children;
      var childNodes = props.noBody ? children : [];
      var $slots = slots();

      if (!props.noBody) {
        if ($slots.aside && !props.rightAlign) {
          childNodes.push(h(BMediaAside, {
            staticClass: 'mr-3',
            props: {
              verticalAlign: props.verticalAlign
            }
          }, $slots.aside));
        }

        childNodes.push(h(BMediaBody, $slots.default));

        if ($slots.aside && props.rightAlign) {
          childNodes.push(h(BMediaAside, {
            staticClass: 'ml-3',
            props: {
              verticalAlign: props.verticalAlign
            }
          }, $slots.aside));
        }
      }

      return h(props.tag, mergeData(data, {
        staticClass: 'media'
      }), childNodes);
    }
  });

  var components$p = {
    BMedia: BMedia,
    BMediaAside: BMediaAside,
    BMediaBody: BMediaBody
  };
  var index$n = {
    install: installFactory({
      components: components$p
    })
  };

  /**
   * Private ModalManager helper
   * Handles controlling modal stacking zIndexes and body adjustments/classes
   */
  // Default modal backdrop z-index

  var DEFAULT_ZINDEX = 1040; // Selectors for padding/margin adjustments

  var Selector$1 = {
    FIXED_CONTENT: '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top',
    STICKY_CONTENT: '.sticky-top',
    NAVBAR_TOGGLER: '.navbar-toggler' // @vue/component

  };
  var ModalManager = Vue.extend({
    data: function data() {
      return {
        modals: [],
        baseZIndex: null,
        scrollbarWidth: null,
        isBodyOverflowing: false
      };
    },
    computed: {
      modalCount: function modalCount() {
        return this.modals.length;
      },
      modalsAreOpen: function modalsAreOpen() {
        return this.modalCount > 0;
      }
    },
    watch: {
      modalCount: function modalCount(newCount, oldCount) {
        if (isBrowser) {
          this.getScrollbarWidth();

          if (newCount > 0 && oldCount === 0) {
            // Transitioning to modal(s) open
            this.checkScrollbar();
            this.setScrollbar();
            addClass(document.body, 'modal-open');
          } else if (newCount === 0 && oldCount > 0) {
            // Transitioning to modal(s) closed
            this.resetScrollbar();
            removeClass(document.body, 'modal-open');
          }

          setAttr(document.body, 'data-modal-open-count', String(newCount));
        }
      },
      modals: function modals(newVal, oldVal) {
        var _this = this;

        this.checkScrollbar();
        requestAF(function () {
          _this.updateModals(newVal || []);
        });
      }
    },
    methods: {
      // Public methods
      registerModal: function registerModal(modal) {
        var _this2 = this;

        if (modal && this.modals.indexOf(modal) === -1) {
          // Add modal to modals array
          this.modals.push(modal);
          modal.$once('hook:beforeDestroy', function () {
            _this2.unregisterModal(modal);
          });
        }
      },
      unregisterModal: function unregisterModal(modal) {
        var index = this.modals.indexOf(modal);

        if (index > -1) {
          // Remove modal from modals array
          this.modals.splice(index, 1); // Reset the modal's data

          if (!(modal._isBeingDestroyed || modal._isDestroyed)) {
            this.resetModal(modal);
          }
        }
      },
      getBaseZIndex: function getBaseZIndex() {
        if (isNull(this.baseZIndex) && isBrowser) {
          // Create a temporary `div.modal-backdrop` to get computed z-index
          var div = document.createElement('div');
          div.className = 'modal-backdrop d-none';
          div.style.display = 'none';
          document.body.appendChild(div);
          this.baseZIndex = parseInt(getCS(div).zIndex || DEFAULT_ZINDEX, 10);
          document.body.removeChild(div);
        }

        return this.baseZIndex || DEFAULT_ZINDEX;
      },
      getScrollbarWidth: function getScrollbarWidth() {
        if (isNull(this.scrollbarWidth) && isBrowser) {
          // Create a temporary `div.measure-scrollbar` to get computed z-index
          var div = document.createElement('div');
          div.className = 'modal-scrollbar-measure';
          document.body.appendChild(div);
          this.scrollbarWidth = getBCR(div).width - div.clientWidth;
          document.body.removeChild(div);
        }

        return this.scrollbarWidth || 0;
      },
      // Private methods
      updateModals: function updateModals(modals) {
        var _this3 = this;

        var baseZIndex = this.getBaseZIndex();
        var scrollbarWidth = this.getScrollbarWidth();
        modals.forEach(function (modal, index) {
          // We update data values on each modal
          modal.zIndex = baseZIndex + index;
          modal.scrollbarWidth = scrollbarWidth;
          modal.isTop = index === _this3.modals.length - 1;
          modal.isBodyOverflowing = _this3.isBodyOverflowing;
        });
      },
      resetModal: function resetModal(modal) {
        if (modal) {
          modal.zIndex = this.getBaseZIndex();
          modal.isTop = true;
          modal.isBodyOverflowing = false;
        }
      },
      checkScrollbar: function checkScrollbar() {
        // Determine if the body element is overflowing
        // const { left, right, height } = getBCR(document.body)
        // Extra check for body.height needed for stacked modals
        // this.isBodyOverflowing = left + right < window.innerWidth || height > window.innerHeight
        var _getBCR = getBCR(document.body),
            left = _getBCR.left,
            right = _getBCR.right;

        this.isBodyOverflowing = left + right < window.innerWidth;
      },
      setScrollbar: function setScrollbar() {
        var body = document.body; // Storage place to cache changes to margins and padding
        // Note: This assumes the following element types are not added to the
        // document after the modal has opened.

        body._paddingChangedForModal = body._paddingChangedForModal || [];
        body._marginChangedForModal = body._marginChangedForModal || [];

        if (this.isBodyOverflowing) {
          var scrollbarWidth = this.scrollbarWidth; // Adjust fixed content padding

          /* istanbul ignore next: difficult to test in JSDOM */

          selectAll(Selector$1.FIXED_CONTENT).forEach(function (el) {
            var actualPadding = el.style.paddingRight;
            var calculatedPadding = getCS(el).paddingRight || 0;
            setAttr(el, 'data-padding-right', actualPadding);
            el.style.paddingRight = "".concat(parseFloat(calculatedPadding) + scrollbarWidth, "px");

            body._paddingChangedForModal.push(el);
          }); // Adjust sticky content margin

          /* istanbul ignore next: difficult to test in JSDOM */

          selectAll(Selector$1.STICKY_CONTENT).forEach(function (el) {
            var actualMargin = el.style.marginRight;
            var calculatedMargin = getCS(el).marginRight || 0;
            setAttr(el, 'data-margin-right', actualMargin);
            el.style.marginRight = "".concat(parseFloat(calculatedMargin) - scrollbarWidth, "px");

            body._marginChangedForModal.push(el);
          }); // Adjust <b-navbar-toggler> margin

          /* istanbul ignore next: difficult to test in JSDOM */

          selectAll(Selector$1.NAVBAR_TOGGLER).forEach(function (el) {
            var actualMargin = el.style.marginRight;
            var calculatedMargin = getCS(el).marginRight || 0;
            setAttr(el, 'data-margin-right', actualMargin);
            el.style.marginRight = "".concat(parseFloat(calculatedMargin) + scrollbarWidth, "px");

            body._marginChangedForModal.push(el);
          }); // Adjust body padding

          var actualPadding = body.style.paddingRight;
          var calculatedPadding = getCS(body).paddingRight;
          setAttr(body, 'data-padding-right', actualPadding);
          body.style.paddingRight = "".concat(parseFloat(calculatedPadding) + scrollbarWidth, "px");
        }
      },
      resetScrollbar: function resetScrollbar() {
        var body = document.body;

        if (body._paddingChangedForModal) {
          // Restore fixed content padding
          body._paddingChangedForModal.forEach(function (el) {
            /* istanbul ignore next: difficult to test in JSDOM */
            if (hasAttr(el, 'data-padding-right')) {
              el.style.paddingRight = getAttr(el, 'data-padding-right') || '';
              removeAttr(el, 'data-padding-right');
            }
          });
        }

        if (body._marginChangedForModal) {
          // Restore sticky content and navbar-toggler margin
          body._marginChangedForModal.forEach(function (el) {
            /* istanbul ignore next: difficult to test in JSDOM */
            if (hasAttr(el, 'data-margin-right')) {
              el.style.marginRight = getAttr(el, 'data-margin-right') || '';
              removeAttr(el, 'data-margin-right');
            }
          });
        }

        body._paddingChangedForModal = null;
        body._marginChangedForModal = null; // Restore body padding

        if (hasAttr(body, 'data-padding-right')) {
          body.style.paddingRight = getAttr(body, 'data-padding-right') || '';
          removeAttr(body, 'data-padding-right');
        }
      }
    }
  }); // Export our ModalManager

  var modalManager = new ModalManager();

  var BvModalEvent =
  /*#__PURE__*/
  function (_BvEvent) {
    _inherits(BvModalEvent, _BvEvent);

    function BvModalEvent(type) {
      var _this;

      var eventInit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, BvModalEvent);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(BvModalEvent).call(this, type, eventInit)); // Freeze our new props as readonly, but leave them enumerable

      defineProperties(_assertThisInitialized(_this), {
        modalId: readonlyDescriptor(),
        trigger: readonlyDescriptor()
      });
      return _this;
    }

    _createClass(BvModalEvent, [{
      key: "cancel",
      value: function cancel()
      /* istanbul ignore next */
      {
        // Backwards compatibility for BootstrapVue 1.x
        warn('b-modal: evt.cancel() is deprecated. Please use evt.preventDefault().');
        this.preventDefault();
      }
    }], [{
      key: "Defaults",
      get: function get() {
        return _objectSpread({}, _get(_getPrototypeOf(BvModalEvent), "Defaults", this), {
          modalId: null,
          trigger: null
        });
      }
    }]);

    return BvModalEvent;
  }(BvEvent); // Named exports

  var NAME$c = 'BModal'; // ObserveDom config to detect changes in modal content
  // so that we can adjust the modal padding if needed

  var OBSERVER_CONFIG = {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['style', 'class'] // Options for DOM event listeners

  };
  var EVT_OPTIONS = {
    passive: true,
    capture: false
  };
  var props$G = {
    title: {
      type: String,
      default: ''
    },
    titleHtml: {
      type: String
    },
    titleTag: {
      type: String,
      default: 'h5'
    },
    size: {
      type: String,
      default: 'md'
    },
    centered: {
      type: Boolean,
      default: false
    },
    scrollable: {
      type: Boolean,
      default: false
    },
    buttonSize: {
      type: String,
      default: ''
    },
    noStacking: {
      type: Boolean,
      default: false
    },
    noFade: {
      type: Boolean,
      default: false
    },
    noCloseOnBackdrop: {
      type: Boolean,
      default: false
    },
    noCloseOnEsc: {
      type: Boolean,
      default: false
    },
    noEnforceFocus: {
      type: Boolean,
      default: false
    },
    headerBgVariant: {
      type: String,
      default: null
    },
    headerBorderVariant: {
      type: String,
      default: null
    },
    headerTextVariant: {
      type: String,
      default: null
    },
    headerCloseVariant: {
      type: String,
      default: null
    },
    headerClass: {
      type: [String, Array],
      default: null
    },
    bodyBgVariant: {
      type: String,
      default: null
    },
    bodyTextVariant: {
      type: String,
      default: null
    },
    modalClass: {
      type: [String, Array],
      default: null
    },
    dialogClass: {
      type: [String, Array],
      default: null
    },
    contentClass: {
      type: [String, Array],
      default: null
    },
    bodyClass: {
      type: [String, Array],
      default: null
    },
    footerBgVariant: {
      type: String,
      default: null
    },
    footerBorderVariant: {
      type: String,
      default: null
    },
    footerTextVariant: {
      type: String,
      default: null
    },
    footerClass: {
      type: [String, Array],
      default: null
    },
    hideHeader: {
      type: Boolean,
      default: false
    },
    hideFooter: {
      type: Boolean,
      default: false
    },
    hideHeaderClose: {
      type: Boolean,
      default: false
    },
    hideBackdrop: {
      type: Boolean,
      default: false
    },
    okOnly: {
      type: Boolean,
      default: false
    },
    okDisabled: {
      type: Boolean,
      default: false
    },
    cancelDisabled: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: false
    },
    returnFocus: {
      // type: Object,
      default: null
    },
    headerCloseLabel: {
      type: String,
      default: function _default() {
        return String(getComponentConfig(NAME$c, 'headerCloseLabel') || '');
      }
    },
    cancelTitle: {
      type: String,
      default: function _default() {
        return String(getComponentConfig(NAME$c, 'cancelTitle') || '');
      }
    },
    cancelTitleHtml: {
      type: String
    },
    okTitle: {
      type: String,
      default: function _default() {
        return String(getComponentConfig(NAME$c, 'okTitle') || '');
      }
    },
    okTitleHtml: {
      type: String
    },
    cancelVariant: {
      type: String,
      default: function _default() {
        return String(getComponentConfig(NAME$c, 'cancelVariant') || '');
      }
    },
    okVariant: {
      type: String,
      default: function _default() {
        return String(getComponentConfig(NAME$c, 'okVariant') || '');
      }
    },
    lazy: {
      type: Boolean,
      default: false
    },
    busy: {
      type: Boolean,
      default: false
    } // @vue/component

  };
  var BModal = Vue.extend({
    name: NAME$c,
    mixins: [idMixin, listenOnRootMixin, normalizeSlotMixin],
    model: {
      prop: 'visible',
      event: 'change'
    },
    props: props$G,
    data: function data() {
      return {
        is_hidden: this.lazy || false,
        // For lazy modals
        is_visible: false,
        // Controls modal visible state
        is_transitioning: false,
        // Used for style control
        is_show: false,
        // Used for style control
        is_block: false,
        // Used for style control
        is_opening: false,
        // To signal that the modal is in the process of opening
        is_closing: false,
        // To signal that the modal is in the process of closing
        ignoreBackdropClick: false,
        // Used to signify if click out listener should ignore the click
        isModalOverflowing: false,
        return_focus: this.returnFocus || null,
        // The following items are controlled by the modalManager instance
        scrollbarWidth: 0,
        zIndex: modalManager.getBaseZIndex(),
        isTop: true,
        isBodyOverflowing: false
      };
    },
    computed: {
      modalClasses: function modalClasses() {
        return [{
          fade: !this.noFade,
          show: this.is_show,
          'd-block': this.is_block
        }, this.modalClass];
      },
      modalStyles: function modalStyles() {
        var sbWidth = "".concat(this.scrollbarWidth, "px");
        return {
          paddingLeft: !this.isBodyOverflowing && this.isModalOverflowing ? sbWidth : '',
          paddingRight: this.isBodyOverflowing && !this.isModalOverflowing ? sbWidth : ''
        };
      },
      dialogClasses: function dialogClasses() {
        var _ref;

        return [(_ref = {}, _defineProperty(_ref, "modal-".concat(this.size), Boolean(this.size)), _defineProperty(_ref, 'modal-dialog-centered', this.centered), _defineProperty(_ref, 'modal-dialog-scrollable', this.scrollable), _ref), this.dialogClass];
      },
      backdropClasses: function backdropClasses() {
        return {
          fade: !this.noFade,
          show: this.is_show || this.noFade
        };
      },
      headerClasses: function headerClasses() {
        var _ref2;

        return [(_ref2 = {}, _defineProperty(_ref2, "bg-".concat(this.headerBgVariant), Boolean(this.headerBgVariant)), _defineProperty(_ref2, "text-".concat(this.headerTextVariant), Boolean(this.headerTextVariant)), _defineProperty(_ref2, "border-".concat(this.headerBorderVariant), Boolean(this.headerBorderVariant)), _ref2), this.headerClass];
      },
      bodyClasses: function bodyClasses() {
        var _ref3;

        return [(_ref3 = {}, _defineProperty(_ref3, "bg-".concat(this.bodyBgVariant), Boolean(this.bodyBgVariant)), _defineProperty(_ref3, "text-".concat(this.bodyTextVariant), Boolean(this.bodyTextVariant)), _ref3), this.bodyClass];
      },
      footerClasses: function footerClasses() {
        var _ref4;

        return [(_ref4 = {}, _defineProperty(_ref4, "bg-".concat(this.footerBgVariant), Boolean(this.footerBgVariant)), _defineProperty(_ref4, "text-".concat(this.footerTextVariant), Boolean(this.footerTextVariant)), _defineProperty(_ref4, "border-".concat(this.footerBorderVariant), Boolean(this.footerBorderVariant)), _ref4), this.footerClass];
      },
      modalOuterStyle: function modalOuterStyle() {
        // Styles needed for proper stacking of modals
        return {
          position: 'absolute',
          zIndex: this.zIndex
        };
      },
      slotScope: function slotScope() {
        return {
          ok: this.onOk,
          cancel: this.onCancel,
          close: this.onClose,
          hide: this.hide,
          visible: this.is_visible
        };
      }
    },
    watch: {
      visible: function visible(newVal, oldVal) {
        if (newVal !== oldVal) {
          this[newVal ? 'show' : 'hide']();
        }
      }
    },
    created: function created() {
      // Define non-reactive properties
      this._observer = null;
    },
    mounted: function mounted() {
      // Set initial z-index as queried from the DOM
      this.zIndex = modalManager.getBaseZIndex(); // Listen for events from others to either open or close ourselves
      // and listen to all modals to enable/disable enforce focus

      this.listenOnRoot('bv::show::modal', this.showHandler);
      this.listenOnRoot('bv::hide::modal', this.hideHandler);
      this.listenOnRoot('bv::toggle::modal', this.toggleHandler); // Listen for `bv:modal::show events`, and close ourselves if the
      // opening modal not us

      this.listenOnRoot('bv::modal::show', this.modalListener); // Initially show modal?

      if (this.visible === true) {
        this.show();
      }
    },
    beforeDestroy: function beforeDestroy() {
      // Ensure everything is back to normal
      if (this._observer) {
        this._observer.disconnect();

        this._observer = null;
      }

      this.setEnforceFocus(false);
      this.setResizeEvent(false);

      if (this.is_visible) {
        this.is_visible = false;
        this.is_show = false;
        this.is_transitioning = false;
      }
    },
    methods: {
      updateModel: function updateModel(val) {
        if (val !== this.visible) {
          this.$emit('change', val);
        }
      },
      // Public Methods
      show: function show() {
        if (this.is_visible || this.is_opening) {
          // If already open, on in the process of opening, do nothing

          /* istanbul ignore next */
          return;
        }

        if (this.is_closing) {
          // If we are in the process of closing, wait until hidden before re-opening

          /* istanbul ignore next: very difficult to test */
          this.$once('hidden', this.show);
          /* istanbul ignore next */

          return;
        }

        this.is_opening = true;

        if (isBrowser && document.activeElement.focus) {
          // Preset the fallback return focus value if it is not set
          // `document.activeElement` should be the trigger element that was clicked or
          // in the case of using the v-model, which ever element has current focus
          // Will be overridden by some commands such as toggle, etc.
          this.return_focus = this.return_focus || document.activeElement;
        }

        var showEvt = new BvModalEvent('show', {
          cancelable: true,
          vueTarget: this,
          target: this.$refs.modal,
          relatedTarget: null,
          modalId: this.safeId()
        });
        this.emitEvent(showEvt); // Don't show if canceled

        if (showEvt.defaultPrevented || this.is_visible) {
          this.is_opening = false; // Ensure the v-model reflects the current state

          this.updateModel(false);
          return;
        } // Show the modal


        this.doShow();
      },
      hide: function hide(trigger) {
        if (!this.is_visible || this.is_closing) {
          /* istanbul ignore next */
          return;
        }

        this.is_closing = true;
        var hideEvt = new BvModalEvent('hide', {
          cancelable: true,
          vueTarget: this,
          target: this.$refs.modal,
          relatedTarget: null,
          modalId: this.safeId(),
          trigger: trigger || null
        }); // We emit specific event for one of the three built-in buttons

        if (trigger === 'ok') {
          this.$emit('ok', hideEvt);
        } else if (trigger === 'cancel') {
          this.$emit('cancel', hideEvt);
        } else if (trigger === 'headerclose') {
          this.$emit('close', hideEvt);
        }

        this.emitEvent(hideEvt); // Hide if not canceled

        if (hideEvt.defaultPrevented || !this.is_visible) {
          this.is_closing = false; // Ensure v-model reflects current state

          this.updateModel(true);
          return;
        } // Stop observing for content changes


        if (this._observer) {
          this._observer.disconnect();

          this._observer = null;
        }

        this.is_visible = false; // Update the v-model

        this.updateModel(false);
      },
      // Public method to toggle modal visibility
      toggle: function toggle(triggerEl) {
        if (triggerEl) {
          this.return_focus = triggerEl;
        }

        if (this.is_visible) {
          this.hide('toggle');
        } else {
          this.show();
        }
      },
      // Private method to finish showing modal
      doShow: function doShow() {
        var _this = this;

        /* istanbul ignore next: commenting out for now until we can test stacking */
        if (modalManager.modalsAreOpen && this.noStacking) {
          // If another modal(s) is already open, wait for it(them) to close
          this.listenOnRootOnce('bv::modal::hidden', this.doShow);
          return;
        } // Place modal in DOM if lazy


        this.is_hidden = false;
        this.$nextTick(function () {
          // We do this in `$nextTick()` to ensure the modal is in DOM first
          // before we show it
          _this.is_visible = true;
          _this.is_opening = false; // Update the v-model

          _this.updateModel(true); // Observe changes in modal content and adjust if necessary


          _this._observer = observeDom(_this.$refs.content, _this.checkModalOverflow.bind(_this), OBSERVER_CONFIG);
        });
      },
      // Transition handlers
      onBeforeEnter: function onBeforeEnter() {
        this.is_transitioning = true;
        modalManager.registerModal(this);
        this.checkModalOverflow();
        this.setResizeEvent(true);
      },
      onEnter: function onEnter() {
        this.is_block = true;
      },
      onAfterEnter: function onAfterEnter() {
        var _this2 = this;

        this.is_show = true;
        this.is_transitioning = false;
        this.$nextTick(function () {
          var shownEvt = new BvModalEvent('shown', {
            cancelable: false,
            vueTarget: _this2,
            target: _this2.$refs.modal,
            relatedTarget: null,
            modalId: _this2.safeId()
          });

          _this2.emitEvent(shownEvt);

          _this2.focusFirst();

          _this2.setEnforceFocus(true);
        });
      },
      onBeforeLeave: function onBeforeLeave() {
        this.is_transitioning = true;
        this.setResizeEvent(false);
      },
      onLeave: function onLeave() {
        // Remove the 'show' class
        this.is_show = false;
      },
      onAfterLeave: function onAfterLeave() {
        var _this3 = this;

        this.is_block = false;
        this.is_transitioning = false;
        this.setEnforceFocus(false);
        this.isModalOverflowing = false;
        this.$nextTick(function () {
          _this3.returnFocusTo();

          _this3.is_closing = false;
          _this3.return_focus = null; // TODO: Need to find a way to pass the `trigger` property
          //       to the `hidden` event, not just only the `hide` event

          var hiddenEvt = new BvModalEvent('hidden', {
            cancelable: false,
            vueTarget: _this3,
            target: _this3.lazy ? null : _this3.$refs.modal,
            relatedTarget: null,
            modalId: _this3.safeId()
          });

          _this3.emitEvent(hiddenEvt);

          modalManager.unregisterModal(_this3);
        });
      },
      // Event emitter
      emitEvent: function emitEvent(bvModalEvt) {
        var type = bvModalEvt.type; // We emit on root first incase a global listener wants to cancel
        // the event first before the instance emits it's event

        this.emitOnRoot("bv::modal::".concat(type), bvModalEvt, bvModalEvt.modalId);
        this.$emit(type, bvModalEvt);
      },
      // UI event handlers
      onDialogMousedown: function onDialogMousedown() {
        var _this4 = this;

        // Watch to see if the matching mouseup event occurs outside the dialog
        // And if it does, cancel the clickOut handler
        var modal = this.$refs.modal;

        var onceModalMouseup = function onceModalMouseup(evt) {
          eventOff(modal, 'mouseup', onceModalMouseup, EVT_OPTIONS);

          if (evt.target === modal) {
            _this4.ignoreBackdropClick = true;
          }
        };

        eventOn(modal, 'mouseup', onceModalMouseup, EVT_OPTIONS);
      },
      onClickOut: function onClickOut(evt) {
        // Do nothing if not visible, backdrop click disabled, or element
        // that generated click event is no longer in document body
        if (!this.is_visible || this.noCloseOnBackdrop || !contains(document.body, evt.target)) {
          return;
        }

        if (this.ignoreBackdropClick) {
          // Click was initiated inside the modal content, but finished outside
          // Set by the above onDialogMousedown handler
          this.ignoreBackdropClick = false;
          return;
        } // If backdrop clicked, hide modal


        if (!contains(this.$refs.content, evt.target)) {
          this.hide('backdrop');
        }
      },
      onOk: function onOk() {
        this.hide('ok');
      },
      onCancel: function onCancel() {
        this.hide('cancel');
      },
      onClose: function onClose() {
        this.hide('headerclose');
      },
      onEsc: function onEsc(evt) {
        // If ESC pressed, hide modal
        if (evt.keyCode === KEY_CODES.ESC && this.is_visible && !this.noCloseOnEsc) {
          this.hide('esc');
        }
      },
      // Document focusin listener
      focusHandler: function focusHandler(evt) {
        // If focus leaves modal, bring it back
        var modal = this.$refs.modal;

        if (!this.noEnforceFocus && this.isTop && this.is_visible && modal && document !== evt.target && !contains(modal, evt.target)) {
          modal.focus({
            preventScroll: true
          });
        }
      },
      // Turn on/off focusin listener
      setEnforceFocus: function setEnforceFocus(on) {
        var method = on ? eventOn : eventOff;
        method(document, 'focusin', this.focusHandler, EVT_OPTIONS);
      },
      // Resize listener
      setResizeEvent: function setResizeEvent(on) {
        var method = on ? eventOn : eventOff; // These events should probably also check if
        // body is overflowing

        method(window, 'resize', this.checkModalOverflow, EVT_OPTIONS);
        method(window, 'orientationchange', this.checkModalOverflow, EVT_OPTIONS);
      },
      // Root listener handlers
      showHandler: function showHandler(id, triggerEl) {
        if (id === this.id) {
          this.return_focus = triggerEl || document.activeElement || null;
          this.show();
        }
      },
      hideHandler: function hideHandler(id) {
        if (id === this.id) {
          this.hide('event');
        }
      },
      toggleHandler: function toggleHandler(id, triggerEl) {
        if (id === this.id) {
          this.toggle(triggerEl);
        }
      },
      modalListener: function modalListener(bvEvt) {
        // If another modal opens, close this one if stacking not permitted
        if (this.noStacking && bvEvt.vueTarget !== this) {
          this.hide();
        }
      },
      // Focus control handlers
      focusFirst: function focusFirst() {
        // TODO: Add support for finding input element with 'autofocus'
        //       attribute set and focus that element
        // Don't try and focus if we are SSR
        if (isBrowser) {
          var modal = this.$refs.modal;
          var activeElement = document.activeElement; // If the modal contains the activeElement, we don't do anything

          if (modal && !(activeElement && contains(modal, activeElement))) {
            // Make sure top of modal is showing (if longer than the viewport)
            // and focus the modal content wrapper
            this.$nextTick(function () {
              modal.scrollTop = 0;
              modal.focus();
            });
          }
        }
      },
      returnFocusTo: function returnFocusTo() {
        // Prefer `returnFocus` prop over event specified
        // `return_focus` value
        var el = this.returnFocus || this.return_focus || document.activeElement || null; // Is el a string CSS selector?

        el = isString(el) ? select(el) : el;

        if (el) {
          // Possibly could be a component reference
          el = el.$el || el;

          if (isVisible(el) && el.focus) {
            el.focus();
          }
        }
      },
      checkModalOverflow: function checkModalOverflow() {
        if (this.is_visible) {
          var modal = this.$refs.modal;
          this.isModalOverflowing = modal.scrollHeight > document.documentElement.clientHeight;
        }
      }
    },
    render: function render(h) {
      var _this5 = this;

      var $slots = this.$slots; // Modal header

      var header = h(false);

      if (!this.hideHeader) {
        var modalHeader = this.normalizeSlot('modal-header', this.slotScope);

        if (!modalHeader) {
          var closeButton = h(false);

          if (!this.hideHeaderClose) {
            closeButton = h(BButtonClose, {
              props: {
                disabled: this.is_transitioning,
                ariaLabel: this.headerCloseLabel,
                textVariant: this.headerCloseVariant || this.headerTextVariant
              },
              on: {
                click: function click(evt) {
                  _this5.onClose();
                }
              }
            }, [$slots['modal-header-close']]);
          }

          modalHeader = [h(this.titleTag, {
            class: ['modal-title']
          }, [this.normalizeSlot('modal-title', this.slotScope) || this.titleHtml || stripTags(this.title)]), closeButton];
        }

        header = h('header', {
          ref: 'header',
          staticClass: 'modal-header',
          class: this.headerClasses,
          attrs: {
            id: this.safeId('__BV_modal_header_')
          }
        }, [modalHeader]);
      } // Modal body


      var body = h('div', {
        ref: 'body',
        staticClass: 'modal-body',
        class: this.bodyClasses,
        attrs: {
          id: this.safeId('__BV_modal_body_')
        }
      }, this.normalizeSlot('default', this.slotScope)); // Modal footer

      var footer = h(false);

      if (!this.hideFooter) {
        var modalFooter = this.normalizeSlot('modal-footer', this.slotScope);

        if (!modalFooter) {
          var cancelButton = h(false);

          if (!this.okOnly) {
            cancelButton = h(BButton, {
              props: {
                variant: this.cancelVariant,
                size: this.buttonSize,
                disabled: this.cancelDisabled || this.busy || this.is_transitioning
              },
              on: {
                click: function click(evt) {
                  _this5.onCancel();
                }
              }
            }, [$slots['modal-cancel'] || this.cancelTitleHtml || stripTags(this.cancelTitle)]);
          }

          var okButton = h(BButton, {
            props: {
              variant: this.okVariant,
              size: this.buttonSize,
              disabled: this.okDisabled || this.busy || this.is_transitioning
            },
            on: {
              click: function click(evt) {
                _this5.onOk();
              }
            }
          }, [$slots['modal-ok'] || this.okTitleHtml || stripTags(this.okTitle)]);
          modalFooter = [cancelButton, okButton];
        }

        footer = h('footer', {
          ref: 'footer',
          staticClass: 'modal-footer',
          class: this.footerClasses,
          attrs: {
            id: this.safeId('__BV_modal_footer_')
          }
        }, [modalFooter]);
      } // Assemble modal content


      var modalContent = h('div', {
        ref: 'content',
        staticClass: 'modal-content',
        class: this.contentClass,
        attrs: {
          role: 'document',
          id: this.safeId('__BV_modal_content_'),
          'aria-labelledby': this.hideHeader ? null : this.safeId('__BV_modal_header_'),
          'aria-describedby': this.safeId('__BV_modal_body_')
        }
      }, [header, body, footer]); // Modal dialog wrapper

      var modalDialog = h('div', {
        staticClass: 'modal-dialog',
        class: this.dialogClasses,
        on: {
          mousedown: this.onDialogMousedown
        }
      }, [modalContent]); // Modal

      var modal = h('div', {
        ref: 'modal',
        staticClass: 'modal',
        class: this.modalClasses,
        style: this.modalStyles,
        directives: [{
          name: 'show',
          rawName: 'v-show',
          value: this.is_visible,
          expression: 'is_visible'
        }],
        attrs: {
          id: this.safeId(),
          role: 'dialog',
          tabindex: '-1',
          'aria-hidden': this.is_visible ? null : 'true',
          'aria-modal': this.is_visible ? 'true' : null
        },
        on: {
          keydown: this.onEsc,
          click: this.onClickOut
        }
      }, [modalDialog]); // Wrap modal in transition

      modal = h('transition', {
        props: {
          enterClass: '',
          enterToClass: '',
          enterActiveClass: '',
          leaveClass: '',
          leaveActiveClass: '',
          leaveToClass: ''
        },
        on: {
          'before-enter': this.onBeforeEnter,
          enter: this.onEnter,
          'after-enter': this.onAfterEnter,
          'before-leave': this.onBeforeLeave,
          leave: this.onLeave,
          'after-leave': this.onAfterLeave
        }
      }, [modal]); // Modal backdrop

      var backdrop = h(false);

      if (!this.hideBackdrop && (this.is_visible || this.is_transitioning || this.is_block)) {
        backdrop = h('div', {
          staticClass: 'modal-backdrop',
          class: this.backdropClasses,
          attrs: {
            id: this.safeId('__BV_modal_backdrop_')
          }
        }, [$slots['modal-backdrop']]);
      } // Tab trap to prevent page from scrolling to next element in
      // tab index during enforce focus tab cycle


      var tabTrap = h(false);

      if (this.is_visible && this.isTop && !this.noEnforceFocus) {
        tabTrap = h('div', {
          attrs: {
            tabindex: '0'
          }
        });
      } // Assemble modal and backdrop in an outer <div>
      // Needed for lazy modals


      var outer = h(false);

      if (!this.is_hidden) {
        outer = h('div', {
          key: 'modal-outer',
          style: this.modalOuterStyle,
          attrs: {
            id: this.safeId('__BV_modal_outer_')
          }
        }, [modal, tabTrap, backdrop]);
      } // Wrap in <div> to maintain `this.$el` reference for
      // hide/show method access


      return h('div', {}, [outer]);
    }
  });

  var PROP_NAME = '$bvModal'; // Base modal props that are allowed
  // Some may be ignored or overridden on some message boxes
  // Prop ID is allowed, but really only should be used for testing
  // We need to add it in explicitly as it comes from the `idMixin`

  var BASE_PROPS = ['id'].concat(_toConsumableArray(keys(omit(props$G, ['busy', 'lazy', 'noStacking', 'visible'])))); // Fallback event resolver (returns undefined)

  var defaultResolver = function defaultResolver(bvModalEvt) {}; // Map prop names to modal slot names


  var propsToSlots = {
    msgBoxContent: 'default',
    title: 'modal-title',
    okTitle: 'modal-ok',
    cancelTitle: 'modal-cancel' // --- Utility methods ---
    // Method to filter only recognized props that are not undefined

  };

  var filterOptions = function filterOptions(options) {
    return BASE_PROPS.reduce(function (memo, key) {
      if (!isUndefined(options[key])) {
        memo[key] = options[key];
      }

      return memo;
    }, {});
  }; // Create a private sub-component that extends BModal
  // which self-destructs after hidden
  // @vue/component


  var MsgBox = Vue.extend({
    name: 'BMsgBox',
    extends: BModal,
    destroyed: function destroyed() {
      // Make sure we not in document any more
      if (this.$el && this.$el.parentNode) {
        this.$el.parentNode.removeChild(this.$el);
      }
    },
    mounted: function mounted() {
      var _this = this;

      // Self destruct handler
      var handleDestroy = function handleDestroy() {
        var self = _this;

        _this.$nextTick(function () {
          // In a `setTimeout()` to release control back to application
          setTimeout(function () {
            return self.$destroy();
          }, 0);
        });
      }; // Self destruct if parent destroyed


      this.$parent.$once('hook:destroyed', handleDestroy); // Self destruct after hidden

      this.$once('hidden', handleDestroy); // Self destruct on route change

      /* istanbul ignore if */

      if (this.$router && this.$route) {
        var unwatch = this.$watch('$router', handleDestroy);
        this.$once('hook:beforeDestroy', unwatch);
      } // Should we also self destruct on parent deactivation?
      // Show the `MsgBox`


      this.show();
    }
  }); // Method to generate the on-demand modal message box
  // Returns a promise that resolves to a value returned by the resolve

  var asyncMsgBox = function asyncMsgBox(props, $parent) {
    var resolver = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultResolver;

    if (warnNotClient(PROP_NAME) || warnNoPromiseSupport(PROP_NAME)) {
      // Should this throw an error?

      /* istanbul ignore next */
      return;
    } // Create an instance of `MsgBox` component


    var msgBox = new MsgBox({
      // We set parent as the local VM so these modals can emit events on
      // the app `$root`, as needed by things like tooltips and popovers
      // And it helps to ensure `MsgBox` is destroyed when parent is destroyed
      parent: $parent,
      // Preset the prop values
      propsData: _objectSpread({}, filterOptions(getComponentConfig('BModal') || {}), {
        // Defaults that user can override
        hideHeaderClose: true,
        hideHeader: !(props.title || props.titleHtml)
      }, omit(props, ['msgBoxContent']), {
        // Props that can't be overridden
        lazy: false,
        busy: false,
        visible: false,
        noStacking: false,
        noEnforceFocus: false
      })
    }); // Convert certain props to scoped slots

    keys(propsToSlots).forEach(function (prop) {
      if (!isUndefined(props[prop])) {
        // Can be a string, or array of VNodes.
        // Alternatively, user can use HTML version of prop to pass an HTML string.
        msgBox.$slots[propsToSlots[prop]] = props[prop];
      }
    }); // Create a mount point (a DIV)

    var div = document.createElement('div');
    document.body.appendChild(div); // Return a promise that resolves when hidden, or rejects on destroyed

    return new Promise(function (resolve, reject) {
      var resolved = false;
      msgBox.$once('hook:destroyed', function () {
        if (!resolved) {
          /* istanbul ignore next */
          reject(new Error('BootstrapVue MsgBox destroyed before resolve'));
        }
      });
      msgBox.$on('hide', function (bvModalEvt) {
        if (!bvModalEvt.defaultPrevented) {
          var result = resolver(bvModalEvt); // If resolver didn't cancel hide, we resolve

          if (!bvModalEvt.defaultPrevented) {
            resolved = true;
            resolve(result);
          }
        }
      }); // Mount the `MsgBox`, which will auto-trigger it to show

      msgBox.$mount(div);
    });
  }; // BvModal instance property class


  var BvModal =
  /*#__PURE__*/
  function () {
    function BvModal(vm) {
      _classCallCheck(this, BvModal);

      // Assign the new properties to this instance
      assign$1(this, {
        _vm: vm,
        _root: vm.$root
      }); // Set these properties as read-only and non-enumerable

      defineProperties(this, {
        _vm: readonlyDescriptor(),
        _root: readonlyDescriptor()
      });
    } // --- Instance methods ---
    // Show modal with the specified ID args are for future use


    _createClass(BvModal, [{
      key: "show",
      value: function show(id) {
        if (id && this._root) {
          var _this$_root;

          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          (_this$_root = this._root).$emit.apply(_this$_root, ['bv::show::modal', id].concat(args));
        }
      } // Hide modal with the specified ID args are for future use

    }, {
      key: "hide",
      value: function hide(id) {
        if (id && this._root) {
          var _this$_root2;

          for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
          }

          (_this$_root2 = this._root).$emit.apply(_this$_root2, ['bv::hide::modal', id].concat(args));
        }
      } // TODO: Could make Promise versions of above that first checks
      //       if modal is in document (by ID) and if not found reject
      //       the Promise. Otherwise waits for hide/hidden event and
      //       then resolves returning the `BvModalEvent` object
      //       (which contains the details)
      // The following methods require Promise support!
      // IE 11 and others do not support Promise natively, so users
      // should have a Polyfill loaded (which they need anyways for IE 11 support)
      // Opens a user defined message box and returns a promise

    }, {
      key: "msgBox",
      value: function msgBox(content) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var resolver = arguments.length > 2 ? arguments[2] : undefined;

        if (!content || warnNoPromiseSupport(PROP_NAME) || warnNotClient(PROP_NAME) || !isFunction(resolver)) {
          // Should this throw an error?

          /* istanbul ignore next */
          return;
        }

        var props = _objectSpread({}, filterOptions(options), {
          msgBoxContent: content
        });

        return asyncMsgBox(props, this._vm, resolver);
      } // Open a message box with OK button only and returns a promise

    }, {
      key: "msgBoxOk",
      value: function msgBoxOk(message) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        // Pick the modal props we support from options
        var props = _objectSpread({}, options, {
          // Add in overrides and our content prop
          okOnly: true,
          okDisabled: false,
          hideFooter: false,
          msgBoxContent: message
        });

        return this.msgBox(message, props, function (bvModalEvt) {
          // Always resolve to true for OK
          return true;
        });
      } // Open a message box modal with OK and CANCEL buttons
      // and returns a promise

    }, {
      key: "msgBoxConfirm",
      value: function msgBoxConfirm(message) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        // Set the modal props we support from options
        var props = _objectSpread({}, options, {
          // Add in overrides and our content prop
          okOnly: false,
          okDisabled: false,
          cancelDisabled: false,
          hideFooter: false
        });

        return this.msgBox(message, props, function (bvModalEvt) {
          var trigger = bvModalEvt.trigger;
          return trigger === 'ok' ? true : trigger === 'cancel' ? false : null;
        });
      }
    }]);

    return BvModal;
  }(); // Method to install `$bvModal` VM injection


  var install = function install(_Vue) {
    if (install._installed) {
      // Only install once

      /* istanbul ignore next */
      return;
    }

    install._installed = true; // Add our instance mixin

    _Vue.mixin({
      beforeCreate: function beforeCreate() {
        // Because we need access to `$root` for `$emits`, and VM for parenting,
        // we have to create a fresh instance of `BvModal` for each VM
        this._bv__modal = new BvModal(this);
      }
    }); // Define our read-only `$bvModal` instance property
    // Placed in an if just in case in HMR mode


    if (!_Vue.prototype.hasOwnProperty(PROP_NAME)) {
      defineProperty(_Vue.prototype, PROP_NAME, {
        get: function get() {
          return this._bv__modal;
        }
      });
    }
  };

  var listenTypes$1 = {
    click: true // Emitted show event for modal

  };
  var EVENT_SHOW = 'bv::show::modal';

  var setRole = function setRole(el, binding, vnode) {
    if (el.tagName !== 'BUTTON') {
      setAttr(el, 'role', 'button');
    }
  };
  /*
   * Export our directive
   */


  var BModalDirective = {
    // eslint-disable-next-line no-shadow-restricted-names
    bind: function bind(el, binding, vnode) {
      bindTargets(vnode, binding, listenTypes$1, function (_ref) {
        var targets = _ref.targets,
            vnode = _ref.vnode;
        targets.forEach(function (target) {
          vnode.context.$root.$emit(EVENT_SHOW, target, vnode.elm);
        });
      }); // If element is not a button, we add `role="button"` for accessibility

      setRole(el, binding, vnode);
    },
    updated: setRole,
    componentUpdated: setRole,
    unbind: function unbind(el, binding, vnode) {
      unbindTargets(vnode, binding, listenTypes$1); // If element is not a button, we add `role="button"` for accessibility

      if (el.tagName !== 'BUTTON') {
        removeAttr(el, 'role', 'button');
      }
    }
  };

  var components$q = {
    BModal: BModal
  };
  var directives$1 = {
    BModal: BModalDirective
  };

  var _install = installFactory({
    components: components$q,
    directives: directives$1
  });

  var index$o = {
    install: function install$1(Vue) {
      // Inject `$bvModal` into Vue prototype
      install(Vue); // Install component and directive

      _install(Vue);
    }
  };

  var DEPRECATED_MSG$1 = 'Setting prop "is-nav-bar" is deprecated. Use the <b-navbar-nav> component instead.';
  var props$H = {
    tag: {
      type: String,
      default: 'ul'
    },
    fill: {
      type: Boolean,
      default: false
    },
    justified: {
      type: Boolean,
      default: false
    },
    align: {
      type: String,
      default: null
    },
    tabs: {
      type: Boolean,
      default: false
    },
    pills: {
      type: Boolean,
      default: false
    },
    vertical: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    },
    isNavBar: {
      type: Boolean,
      default: false,
      // `deprecated` -> Don't use this prop
      // `deprecation` -> Refers to a change in prop usage
      deprecated: DEPRECATED_MSG$1
    } // -- Utils --

  };

  var computeJustifyContent = function computeJustifyContent(value) {
    // Normalize value
    value = value === 'left' ? 'start' : value === 'right' ? 'end' : value;
    return "justify-content-".concat(value);
  }; // @vue/component


  var BNav = Vue.extend({
    name: 'BNav',
    functional: true,
    props: props$H,
    render: function render(h, _ref) {
      var _class;

      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.tag, mergeData(data, {
        class: (_class = {
          nav: !props.isNavBar,
          'navbar-nav': props.isNavBar,
          'nav-tabs': props.tabs && !props.isNavBar,
          'nav-pills': props.pills && !props.isNavBar,
          'flex-column': props.vertical && !props.isNavBar,
          'nav-fill': !props.vertical && props.fill,
          'nav-justified': !props.vertical && props.justified
        }, _defineProperty(_class, computeJustifyContent(props.align), !props.vertical && props.align), _defineProperty(_class, "small", props.small), _class)
      }), children);
    }
  });

  var props$I = propsFactory(); // @vue/component

  var BNavItem = Vue.extend({
    name: 'BNavItem',
    functional: true,
    props: _objectSpread({}, props$I, {
      linkAttrs: {
        type: Object,
        default: function _default() {
          return {};
        }
      },
      linkClasses: {
        type: [String, Object, Array],
        default: null
      }
    }),
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          listeners = _ref.listeners,
          children = _ref.children;
      // We transfer the listeners to the link
      delete data.on;
      return h('li', mergeData(data, {
        staticClass: 'nav-item'
      }), [h(BLink, {
        staticClass: 'nav-link',
        class: props.linkClasses,
        attrs: props.linkAttrs,
        props: props,
        on: listeners
      }, children)]);
    }
  });

  var props$J = {
    tag: {
      type: String,
      default: 'span'
    } // @vue/component

  };
  var BNavText = Vue.extend({
    name: 'BNavText',
    functional: true,
    props: props$J,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.tag, mergeData(data, {
        staticClass: 'navbar-text'
      }), children);
    }
  });

  var props$K = omit(props$t, ['inline']); // @vue/component

  var BNavForm = Vue.extend({
    name: 'BNavForm',
    functional: true,
    props: props$K,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(BForm, mergeData(data, {
        props: _objectSpread({}, props, {
          inline: true
        })
      }), children);
    }
  });

  var props$L = _objectSpread({}, pluckProps(['menuClass', 'toggleClass', 'noCaret', 'role'], props$o), {
    extraMenuClasses: {
      type: String,
      default: '',
      // `deprecated` -> Don't use this prop
      // `deprecation` -> Refers to a change in prop usage
      deprecated: 'Setting prop "extra-menu-classes" is deprecated. Use "menu-class" prop instead.'
    },
    extraToggleClasses: {
      type: String,
      default: '',
      // `deprecated` -> Don't use this prop
      // `deprecation` -> Refers to a change in prop usage
      deprecated: 'Setting prop "extra-toggle-classes" is deprecated. Use "toggle-class" prop instead.'
    } // @vue/component

  });
  var BNavItemDropdown = Vue.extend({
    name: 'BNavItemDropdown',
    mixins: [idMixin, dropdownMixin],
    props: props$L,
    computed: {
      isNav: function isNav() {
        // Signal to dropdown mixin that we are in a navbar
        return true;
      },
      dropdownClasses: function dropdownClasses() {
        return ['nav-item', 'b-nav-dropdown', 'dropdown', this.directionClass, {
          show: this.visible
        }];
      },
      menuClasses: function menuClasses() {
        return ['dropdown-menu', {
          'dropdown-menu-right': this.right,
          show: this.visible
        }, this.extraMenuClasses, // Deprecated
        this.menuClass];
      },
      toggleClasses: function toggleClasses() {
        return ['nav-link', 'dropdown-toggle', {
          'dropdown-toggle-no-caret': this.noCaret
        }, this.extraToggleClasses, // Deprecated
        this.toggleClass];
      }
    },
    render: function render(h) {
      var button = h('a', {
        class: this.toggleClasses,
        ref: 'toggle',
        attrs: {
          href: '#',
          id: this.safeId('_BV_button_'),
          disabled: this.disabled,
          'aria-haspopup': 'true',
          'aria-expanded': String(this.visible)
        },
        on: {
          click: this.toggle,
          keydown: this.toggle // space, enter, down

        }
      }, [this.$slots['button-content'] || this.$slots.text || h('span', {
        domProps: htmlOrText(this.html, this.text)
      })]);
      var menu = h('ul', {
        class: this.menuClasses,
        ref: 'menu',
        attrs: {
          tabindex: '-1',
          'aria-labelledby': this.safeId('_BV_button_')
        },
        on: {
          mouseover: this.onMouseOver,
          keydown: this.onKeydown // tab, up, down, esc

        }
      }, [this.$slots.default]);
      return h('li', {
        attrs: {
          id: this.safeId()
        },
        class: this.dropdownClasses
      }, [button, menu]);
    }
  });

  var components$r = {
    BNav: BNav,
    BNavItem: BNavItem,
    BNavText: BNavText,
    BNavForm: BNavForm,
    BNavItemDropdown: BNavItemDropdown,
    BNavItemDd: BNavItemDropdown,
    BNavDropdown: BNavItemDropdown,
    BNavDd: BNavItemDropdown
  };
  var plugins = {
    DropdownPlugin: DropdownPlugin
  };
  var NavPlugin = {
    install: installFactory({
      components: components$r,
      plugins: plugins
    })
  };

  var props$M = {
    tag: {
      type: String,
      default: 'nav'
    },
    type: {
      type: String,
      default: 'light'
    },
    variant: {
      type: String
    },
    toggleable: {
      type: [Boolean, String],
      default: false
    },
    fixed: {
      type: String
    },
    sticky: {
      type: Boolean,
      default: false
    },
    print: {
      type: Boolean,
      default: false
    } // @vue/component

  };
  var BNavbar = Vue.extend({
    name: 'BNavbar',
    functional: true,
    props: props$M,
    render: function render(h, _ref) {
      var _class;

      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      var breakpoint = '';
      var xs = getBreakpoints()[0];

      if (props.toggleable && isString(props.toggleable) && props.toggleable !== xs) {
        breakpoint = "navbar-expand-".concat(props.toggleable);
      } else if (props.toggleable === false) {
        breakpoint = 'navbar-expand';
      }

      return h(props.tag, mergeData(data, {
        staticClass: 'navbar',
        class: (_class = {
          'd-print': props.print,
          'sticky-top': props.sticky
        }, _defineProperty(_class, "navbar-".concat(props.type), Boolean(props.type)), _defineProperty(_class, "bg-".concat(props.variant), Boolean(props.variant)), _defineProperty(_class, "fixed-".concat(props.fixed), Boolean(props.fixed)), _defineProperty(_class, "".concat(breakpoint), Boolean(breakpoint)), _class),
        attrs: {
          role: props.tag === 'nav' ? null : 'navigation'
        }
      }), children);
    }
  });

  var props$N = pluckProps(['tag', 'fill', 'justified', 'align', 'small'], props$H); // -- Utils --

  var computeJustifyContent$1 = function computeJustifyContent(value) {
    // Normalize value
    value = value === 'left' ? 'start' : value === 'right' ? 'end' : value;
    return "justify-content-".concat(value);
  }; // @vue/component


  var BNavbarNav = Vue.extend({
    name: 'BNavbarNav',
    functional: true,
    props: props$N,
    render: function render(h, _ref) {
      var _class;

      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      return h(props.tag, mergeData(data, {
        staticClass: 'navbar-nav',
        class: (_class = {
          'nav-fill': props.fill,
          'nav-justified': props.justified
        }, _defineProperty(_class, computeJustifyContent$1(props.align), props.align), _defineProperty(_class, "small", props.small), _class)
      }), children);
    }
  });

  var linkProps$3 = propsFactory();
  linkProps$3.href.default = undefined;
  linkProps$3.to.default = undefined;
  var props$O = _objectSpread({}, linkProps$3, {
    tag: {
      type: String,
      default: 'div'
    } // @vue/component

  });
  var BNavbarBrand = Vue.extend({
    name: 'BNavbarBrand',
    functional: true,
    props: props$O,
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      var isLink = Boolean(props.to || props.href);
      var tag = isLink ? BLink : props.tag;
      return h(tag, mergeData(data, {
        staticClass: 'navbar-brand',
        props: isLink ? pluckProps(linkProps$3, props) : {}
      }), children);
    }
  });

  var NAME$d = 'BNavbarToggle'; // Events we emit on $root

  var EVENT_TOGGLE$2 = 'bv::toggle::collapse'; // Events we listen to on $root

  var EVENT_STATE$2 = 'bv::collapse::state'; // This private event is NOT to be documented as people should not be using it.

  var EVENT_STATE_SYNC$2 = 'bv::collapse::sync::state'; // @vue/component

  var BNavbarToggle = Vue.extend({
    name: NAME$d,
    mixins: [listenOnRootMixin],
    props: {
      label: {
        type: String,
        default: function _default() {
          return String(getComponentConfig(NAME$d, 'label') || '');
        }
      },
      target: {
        type: String,
        required: true
      }
    },
    data: function data() {
      return {
        toggleState: false
      };
    },
    created: function created() {
      this.listenOnRoot(EVENT_STATE$2, this.handleStateEvt);
      this.listenOnRoot(EVENT_STATE_SYNC$2, this.handleStateEvt);
    },
    methods: {
      onClick: function onClick(evt) {
        this.$emit('click', evt);

        if (!evt.defaultPrevented) {
          this.$root.$emit(EVENT_TOGGLE$2, this.target);
        }
      },
      handleStateEvt: function handleStateEvt(id, state) {
        if (id === this.target) {
          this.toggleState = state;
        }
      }
    },
    render: function render(h) {
      return h('button', {
        class: ['navbar-toggler'],
        attrs: {
          type: 'button',
          'aria-label': this.label,
          'aria-controls': this.target,
          'aria-expanded': this.toggleState ? 'true' : 'false'
        },
        on: {
          click: this.onClick
        }
      }, [this.$slots.default || h('span', {
        class: ['navbar-toggler-icon']
      })]);
    }
  });

  var components$s = {
    BNavbar: BNavbar,
    BNavbarNav: BNavbarNav,
    BNavbarBrand: BNavbarBrand,
    BNavbarToggle: BNavbarToggle,
    BNavToggle: BNavbarToggle
  };
  var plugins$1 = {
    NavPlugin: NavPlugin,
    CollapsePlugin: CollapsePlugin,
    DropdownPlugin: DropdownPlugin
  };
  var index$p = {
    install: installFactory({
      components: components$s,
      plugins: plugins$1
    })
  };

  /**
   * @param {number} length
   * @return {Array}
   */
  var range = function range(length) {
    return Array.apply(null, {
      length: length
    });
  };

  /*
   * Common props, computed, data, render function, and methods
   * for <b-pagination> and <b-pagination-nav>
   */

  var ELLIPSIS_THRESHOLD = 3; // Default # of buttons limit

  var DEFAULT_LIMIT = 5; // Make an array of N to N+X

  function makePageArray(startNum, numPages) {
    return range(numPages).map(function (value, index) {
      return {
        number: index + startNum,
        classes: null
      };
    });
  } // Sanitize the provided Limit value (converting to a number)


  function sanitizeLimit(value) {
    var limit = parseInt(value, 10) || 1;
    return limit < 1 ? DEFAULT_LIMIT : limit;
  } // Sanitize the provided current page number (converting to a number)


  function sanitizeCurPage(value, numPages) {
    var page = parseInt(value, 10) || 1;
    return page > numPages ? numPages : page < 1 ? 1 : page;
  } // Links don't normally respond to SPACE, so we add that functionality via this handler


  function onSpaceKey(evt) {
    if (evt.keyCode === KEY_CODES.SPACE) {
      evt.preventDefault(); // Stop page from scrolling

      evt.stopImmediatePropagation();
      evt.stopPropagation(); // Trigger the click event on the link

      evt.currentTarget.click();
      return false;
    }
  } // Props object


  var props$P = {
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: [Number, String],
      default: null,
      validator: function validator(value) {
        var num = parseInt(value, 10);
        /* istanbul ignore if */

        if (!isNull(value) && (isNaN(num) || num < 1)) {
          warn('pagination: v-model value must be a number greater than 0');
          return false;
        }

        return true;
      }
    },
    limit: {
      type: [Number, String],
      default: DEFAULT_LIMIT,
      validator: function validator(value) {
        var num = parseInt(value, 10);
        /* istanbul ignore if */

        if (isNaN(num) || num < 1) {
          warn('pagination: prop "limit" must be a number greater than 0');
          return false;
        }

        return true;
      }
    },
    size: {
      type: String,
      default: 'md'
    },
    align: {
      type: String,
      default: 'left'
    },
    hideGotoEndButtons: {
      type: Boolean,
      default: false
    },
    ariaLabel: {
      type: String,
      default: 'Pagination'
    },
    labelFirstPage: {
      type: String,
      default: 'Go to first page'
    },
    firstText: {
      type: String,
      default: '«'
    },
    labelPrevPage: {
      type: String,
      default: 'Go to previous page'
    },
    prevText: {
      type: String,
      default: '‹'
    },
    labelNextPage: {
      type: String,
      default: 'Go to next page'
    },
    nextText: {
      type: String,
      default: '›'
    },
    labelLastPage: {
      type: String,
      default: 'Go to last page'
    },
    lastText: {
      type: String,
      default: '»'
    },
    labelPage: {
      type: [String, Function],
      default: 'Go to page'
    },
    hideEllipsis: {
      type: Boolean,
      default: false
    },
    ellipsisText: {
      type: String,
      default: '…'
    } // @vue/component

  };
  var paginationMixin = {
    mixins: [normalizeSlotMixin],
    model: {
      prop: 'value',
      event: 'input'
    },
    props: props$P,
    data: function data() {
      var curr = parseInt(this.value, 10);
      return {
        // -1 signifies no page initially selected
        currentPage: curr > 0 ? curr : -1,
        localNumPages: 1,
        localLimit: DEFAULT_LIMIT
      };
    },
    computed: {
      btnSize: function btnSize() {
        return this.size ? "pagination-".concat(this.size) : '';
      },
      alignment: function alignment() {
        var align = this.align;

        if (align === 'center') {
          return 'justify-content-center';
        } else if (align === 'end' || align === 'right') {
          return 'justify-content-end';
        } else if (align === 'fill') {
          // The page-items will also have 'flex-fill' added.
          // We ad text centering to make the button appearance better in fill mode.
          return 'text-center';
        }

        return '';
      },
      computedCurrentPage: function computedCurrentPage() {
        return sanitizeCurPage(this.currentPage, this.localNumPages);
      },
      paginationParams: function paginationParams() {
        // Determine if we should show the the ellipsis
        var limit = this.limit;
        var numPages = this.localNumPages;
        var curPage = this.computedCurrentPage;
        var hideEllipsis = this.hideEllipsis;
        var showFirstDots = false;
        var showLastDots = false;
        var numLinks = limit;
        var startNum = 1;

        if (numPages <= limit) {
          // Special Case: Less pages available than the limit of displayed pages
          numLinks = numPages;
        } else if (curPage < limit - 1 && limit > ELLIPSIS_THRESHOLD) {
          // We are near the beginning of the page list
          if (!hideEllipsis) {
            showLastDots = true;
            numLinks = limit - 1;
          }
        } else if (numPages - curPage + 2 < limit && limit > ELLIPSIS_THRESHOLD) {
          // We are near the end of the list
          if (!hideEllipsis) {
            numLinks = limit - 1;
            showFirstDots = true;
          }

          startNum = numPages - numLinks + 1;
        } else {
          // We are somewhere in the middle of the page list
          if (limit > ELLIPSIS_THRESHOLD && !hideEllipsis) {
            numLinks = limit - 2;
            showFirstDots = showLastDots = true;
          }

          startNum = curPage - Math.floor(numLinks / 2);
        } // Sanity checks


        if (startNum < 1) {
          /* istanbul ignore next */
          startNum = 1;
        } else if (startNum > numPages - numLinks) {
          startNum = numPages - numLinks + 1;
        }

        return {
          showFirstDots: showFirstDots,
          showLastDots: showLastDots,
          numLinks: numLinks,
          startNum: startNum
        };
      },
      pageList: function pageList() {
        // Generates the pageList array
        var _this$paginationParam = this.paginationParams,
            numLinks = _this$paginationParam.numLinks,
            startNum = _this$paginationParam.startNum;
        var currPage = this.computedCurrentPage; // Generate list of page numbers

        var pages = makePageArray(startNum, numLinks); // We limit to a total of 3 page buttons on XS screens
        // So add classes to page links to hide them for XS breakpoint
        // Note: Ellipsis will also be hidden on XS screens
        // TODO: Make this visual limit configurable based on breakpoint(s)

        if (pages.length > 3) {
          var idx = currPage - startNum; // THe following is a bootstrap-vue custom utility class

          var classes = 'bv-d-xs-down-none';

          if (idx === 0) {
            // Keep leftmost 3 buttons visible when current page is first page
            for (var i = 3; i < pages.length; i++) {
              pages[i].classes = classes;
            }
          } else if (idx === pages.length - 1) {
            // Keep rightmost 3 buttons visible when current page is last page
            for (var _i = 0; _i < pages.length - 3; _i++) {
              pages[_i].classes = classes;
            }
          } else {
            // Hide all except current page, current page - 1 and current page + 1
            for (var _i2 = 0; _i2 < idx - 1; _i2++) {
              // hide some left button(s)
              pages[_i2].classes = classes;
            }

            for (var _i3 = pages.length - 1; _i3 > idx + 1; _i3--) {
              // hide some right button(s)
              pages[_i3].classes = classes;
            }
          }
        }

        return pages;
      }
    },
    watch: {
      value: function value(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.currentPage = sanitizeCurPage(newValue, this.localNumPages);
        }
      },
      currentPage: function currentPage(newValue, oldValue) {
        if (newValue !== oldValue) {
          // Emit null if no page selected
          this.$emit('input', newValue > 0 ? newValue : null);
        }
      },
      limit: function limit(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.localLimit = sanitizeLimit(newValue);
        }
      }
    },
    created: function created() {
      var _this = this;

      // Set our default values in data
      this.localLimit = sanitizeLimit(this.limit);
      this.$nextTick(function () {
        // Sanity check
        _this.currentPage = _this.currentPage > _this.localNumPages ? _this.localNumPages : _this.currentPage;
      });
    },
    methods: {
      getButtons: function getButtons() {
        // Return only buttons that are visible
        return selectAll('a.page-link', this.$el).filter(function (btn) {
          return isVisible(btn);
        });
      },
      setBtnFocus: function setBtnFocus(btn) {
        btn.focus();
      },
      focusCurrent: function focusCurrent() {
        var _this2 = this;

        // We do this in next tick to ensure buttons have finished rendering
        this.$nextTick(function () {
          var btn = _this2.getButtons().find(function (el) {
            return parseInt(getAttr(el, 'aria-posinset'), 10) === _this2.computedCurrentPage;
          });

          if (btn && btn.focus) {
            _this2.setBtnFocus(btn);
          } else {
            // Fallback if current page is not in button list
            _this2.focusFirst();
          }
        });
      },
      focusFirst: function focusFirst() {
        var _this3 = this;

        // We do this in next tick to ensure buttons have finished rendering
        this.$nextTick(function () {
          var btn = _this3.getButtons().find(function (el) {
            return !isDisabled(el);
          });

          if (btn && btn.focus && btn !== document.activeElement) {
            _this3.setBtnFocus(btn);
          }
        });
      },
      focusLast: function focusLast() {
        var _this4 = this;

        // We do this in next tick to ensure buttons have finished rendering
        this.$nextTick(function () {
          var btn = _this4.getButtons().reverse().find(function (el) {
            return !isDisabled(el);
          });

          if (btn && btn.focus && btn !== document.activeElement) {
            _this4.setBtnFocus(btn);
          }
        });
      },
      focusPrev: function focusPrev() {
        var _this5 = this;

        // We do this in next tick to ensure buttons have finished rendering
        this.$nextTick(function () {
          var buttons = _this5.getButtons();

          var idx = buttons.indexOf(document.activeElement);

          if (idx > 0 && !isDisabled(buttons[idx - 1]) && buttons[idx - 1].focus) {
            _this5.setBtnFocus(buttons[idx - 1]);
          }
        });
      },
      focusNext: function focusNext() {
        var _this6 = this;

        // We do this in next tick to ensure buttons have finished rendering
        this.$nextTick(function () {
          var buttons = _this6.getButtons();

          var idx = buttons.indexOf(document.activeElement);
          var cnt = buttons.length - 1;

          if (idx < cnt && !isDisabled(buttons[idx + 1]) && buttons[idx + 1].focus) {
            _this6.setBtnFocus(buttons[idx + 1]);
          }
        });
      }
    },
    render: function render(h) {
      var _this7 = this;

      var buttons = [];
      var numberOfPages = this.localNumPages;
      var disabled = this.disabled;
      var _this$paginationParam2 = this.paginationParams,
          showFirstDots = _this$paginationParam2.showFirstDots,
          showLastDots = _this$paginationParam2.showLastDots;
      var currPage = this.computedCurrentPage;
      var fill = this.align === 'fill'; // Helper function and flag

      var isActivePage = function isActivePage(pageNum) {
        return pageNum === currPage;
      };

      var noCurrPage = this.currentPage < 1; // Factory function for prev/next/first/last buttons

      var makeEndBtn = function makeEndBtn(linkTo, ariaLabel, btnSlot, btnText, pageTest, key) {
        var isDisabled = disabled || isActivePage(pageTest) || noCurrPage || linkTo < 1 || linkTo > numberOfPages;
        var pageNum = linkTo < 1 ? 1 : linkTo > numberOfPages ? numberOfPages : linkTo;
        var scope = {
          disabled: isDisabled,
          page: pageNum,
          index: pageNum - 1
        };
        var btnContent = _this7.normalizeSlot(btnSlot, scope) || toString$1(btnText) || h(false);
        var inner = h(isDisabled ? 'span' : BLink, {
          staticClass: 'page-link',
          props: isDisabled ? {} : _this7.linkProps(linkTo),
          attrs: {
            role: 'menuitem',
            tabindex: isDisabled ? null : '-1',
            'aria-label': ariaLabel,
            'aria-controls': _this7.ariaControls || null,
            'aria-disabled': isDisabled ? 'true' : null
          },
          on: isDisabled ? {} : {
            click: function click(evt) {
              _this7.onClick(linkTo, evt);
            },
            keydown: onSpaceKey
          }
        }, [btnContent]);
        return h('li', {
          key: key,
          staticClass: 'page-item',
          class: {
            disabled: isDisabled,
            'flex-fill': fill
          },
          attrs: {
            role: 'none presentation',
            'aria-hidden': isDisabled ? 'true' : null
          }
        }, [inner]);
      }; // Ellipsis factory


      var makeEllipsis = function makeEllipsis(isLast) {
        return h('li', {
          key: "ellipsis-".concat(isLast ? 'last' : 'first'),
          staticClass: 'page-item',
          class: ['disabled', 'bv-d-xs-down-none', fill ? 'flex-fill' : ''],
          attrs: {
            role: 'separator'
          }
        }, [h('span', {
          staticClass: 'page-link'
        }, [_this7.normalizeSlot('ellipsis-text', {}) || toString$1(_this7.ellipsisText) || h(false)])]);
      }; // Goto First Page button bookend


      buttons.push(this.hideGotoEndButtons ? h(false) : makeEndBtn(1, this.labelFirstPage, 'first-text', this.firstText, 1, 'bookend-goto-first')); // Goto Previous page button bookend

      buttons.push(makeEndBtn(currPage - 1, this.labelPrevPage, 'prev-text', this.prevText, 1, 'bookend-goto-prev')); // First Ellipsis Bookend

      buttons.push(showFirstDots ? makeEllipsis(false) : h(false)); // Individual Page links

      this.pageList.forEach(function (page, idx) {
        var active = isActivePage(page.number) && !noCurrPage; // Active page will have tabindex of 0, or if no current page and first page button

        var tabIndex = disabled ? null : active || noCurrPage && idx === 0 ? '0' : '-1';
        var attrs = {
          role: 'menuitemradio',
          'aria-disabled': disabled ? 'true' : null,
          'aria-controls': _this7.ariaControls || null,
          'aria-label': isFunction(_this7.labelPage) ? _this7.labelPage(page.number) : "".concat(_this7.labelPage, " ").concat(page.number),
          'aria-checked': active ? 'true' : 'false',
          'aria-posinset': page.number,
          'aria-setsize': numberOfPages,
          // ARIA "roving tabindex" method
          tabindex: tabIndex
        };
        var btnContent = toString$1(_this7.makePage(page.number));
        var scope = {
          page: page.number,
          index: page.number - 1,
          content: btnContent,
          active: active,
          disabled: disabled
        };
        var inner = h(disabled ? 'span' : BLink, {
          props: disabled ? {} : _this7.linkProps(page.number),
          staticClass: 'page-link',
          attrs: attrs,
          on: disabled ? {} : {
            click: function click(evt) {
              _this7.onClick(page.number, evt);
            },
            keydown: onSpaceKey
          }
        }, [_this7.normalizeSlot('page', scope) || btnContent]);
        buttons.push(h('li', {
          key: "page-".concat(page.number),
          staticClass: 'page-item',
          class: [{
            disabled: disabled,
            active: active,
            'flex-fill': fill
          }, page.classes],
          attrs: {
            role: 'none presentation'
          }
        }, [inner]));
      }); // Last Ellipsis Bookend

      buttons.push(showLastDots ? makeEllipsis(true) : h(false)); // Goto Next page button bookend

      buttons.push(makeEndBtn(currPage + 1, this.labelNextPage, 'next-text', this.nextText, numberOfPages, 'bookend-goto-next')); // Goto Last Page button bookend

      buttons.push(this.hideGotoEndButtons ? h(false) : makeEndBtn(numberOfPages, this.labelLastPage, 'last-text', this.lastText, numberOfPages, 'bookend-goto-last')); // Assemble the pagination buttons

      var pagination = h('ul', {
        ref: 'ul',
        staticClass: 'pagination',
        class: ['b-pagination', this.btnSize, this.alignment],
        attrs: {
          role: 'menubar',
          'aria-disabled': disabled ? 'true' : 'false',
          'aria-label': this.ariaLabel || null
        },
        on: {
          keydown: function keydown(evt) {
            var keyCode = evt.keyCode;
            var shift = evt.shiftKey;

            if (keyCode === KEY_CODES.LEFT) {
              evt.preventDefault();
              shift ? _this7.focusFirst() : _this7.focusPrev();
            } else if (keyCode === KEY_CODES.RIGHT) {
              evt.preventDefault();
              shift ? _this7.focusLast() : _this7.focusNext();
            }
          }
        }
      }, buttons); // if we are pagination-nav, wrap in '<nav>' wrapper

      if (this.isNav) {
        return h('nav', {
          attrs: {
            'aria-disabled': disabled ? 'true' : null,
            'aria-hidden': disabled ? 'true' : 'false'
          }
        }, [pagination]);
      } else {
        return pagination;
      }
    }
  };

  var DEFAULT_PER_PAGE = 20;
  var DEFAULT_TOTAL_ROWS = 0;

  function sanitizePerPage(value) {
    var perPage = parseInt(value, 10) || DEFAULT_PER_PAGE;
    return perPage < 1 ? 1 : perPage;
  }

  function sanitizeTotalRows(value) {
    var totalRows = parseInt(value, 10) || DEFAULT_TOTAL_ROWS;
    return totalRows < 0 ? 0 : totalRows;
  }

  var props$Q = {
    perPage: {
      type: [Number, String],
      default: DEFAULT_PER_PAGE
    },
    totalRows: {
      type: [Number, String],
      default: DEFAULT_TOTAL_ROWS
    },
    ariaControls: {
      type: String,
      default: null
    } // Our render function is brought in from the pagination mixin
    // @vue/component

  };
  var BPagination = Vue.extend({
    name: 'BPagination',
    mixins: [paginationMixin],
    props: props$Q,
    computed: {
      numberOfPages: function numberOfPages() {
        var result = Math.ceil(sanitizeTotalRows(this.totalRows) / sanitizePerPage(this.perPage));
        return result < 1 ? 1 : result;
      }
    },
    watch: {
      numberOfPages: function numberOfPages(newVal) {
        if (newVal === this.localNumPages) {
          /* istanbul ignore next */
          return;
        }

        this.localNumPages = newVal;
        this.currentPage = 1;
      }
    },
    created: function created() {
      var _this = this;

      // Set the initial page count
      this.localNumPages = this.numberOfPages; // Set the initial page value

      var curr = parseInt(this.value, 10) || 0;

      if (curr > 0) {
        this.currentPage = curr;
      } else {
        this.$nextTick(function () {
          // If this value parses to NaN or a value less than 1
          // Trigger an initial emit of 'null' if no page specified
          _this.currentPage = 0;
        });
      }
    },
    mounted: function mounted() {
      // Set the initial page count
      this.localNumPages = this.numberOfPages;
    },
    methods: {
      // These methods are used by the render function
      onClick: function onClick(num, evt) {
        var _this2 = this;

        // Handle edge cases where number of pages has changed (i.e. if perPage changes)
        // This should normally not happen, but just in case.
        if (num > this.numberOfPages) {
          /* istanbul ignore next */
          num = this.numberOfPages;
        } else if (num < 1) {
          /* istanbul ignore next */
          num = 1;
        } // Update the v-model


        this.currentPage = num; // Emit event triggered by user interaction

        this.$emit('change', this.currentPage);
        this.$nextTick(function () {
          // Keep the current button focused if possible
          var target = evt.target;

          if (isVisible(target) && _this2.$el.contains(target) && target.focus) {
            target.focus();
          } else {
            _this2.focusCurrent();
          }
        });
      },
      makePage: function makePage(pageNum) {
        return pageNum;
      },
      linkProps: function linkProps(pageNum) {
        // Always '#' for pagination component
        return {
          href: '#'
        };
      }
    }
  });

  var components$t = {
    BPagination: BPagination
  };
  var index$q = {
    install: installFactory({
      components: components$t
    })
  };

  var props$R = {
    // pagination-nav specific props
    numberOfPages: {
      type: [Number, String],
      default: 1,
      validator: function validator(value) {
        var num = parseInt(value, 10);
        /* istanbul ignore if */

        if (isNaN(num) || num < 1) {
          warn('b-pagination: prop "number-of-pages" must be a number greater than 0');
          return false;
        }

        return true;
      }
    },
    baseUrl: {
      type: String,
      default: '/'
    },
    useRouter: {
      type: Boolean,
      default: false
    },
    linkGen: {
      type: Function,
      default: null
    },
    pageGen: {
      type: Function,
      default: null
    },
    pages: {
      // Optional array of page links
      type: Array,
      default: null
    },
    noPageDetect: {
      // Disable auto page number detection if true
      type: Boolean,
      default: false
    },
    // router-link specific props
    activeClass: {
      type: String // default: undefined

    },
    exact: {
      type: Boolean,
      default: false
    },
    exactActiveClass: {
      type: String // default: undefined

    },
    // nuxt-link specific prop(s)
    noPrefetch: {
      type: Boolean,
      default: false
    } // TODO: move this to an instance method in pagination mixin

  };

  var sanitizeNumPages = function sanitizeNumPages(value) {
    var num = parseInt(value, 10) || 1;
    return num < 1 ? 1 : num;
  }; // Our render function is brought in via the pagination mixin
  // @vue/component


  var BPaginationNav = Vue.extend({
    name: 'BPaginationNav',
    mixins: [paginationMixin],
    props: props$R,
    computed: {
      // Used by render function to trigger wrapping in '<nav>' element
      isNav: function isNav() {
        return true;
      },
      computedValue: function computedValue() {
        // Returns the value prop as a number or `null` if undefined or < 1
        var val = parseInt(this.value, 10);
        return isNaN(val) || val < 1 ? null : val;
      }
    },
    watch: {
      numberOfPages: function numberOfPages(newVal, oldVal) {
        var _this = this;

        this.$nextTick(function () {
          _this.setNumPages();
        });
      },
      pages: function pages(newVal, oldVal) {
        var _this2 = this;

        this.$nextTick(function () {
          _this2.setNumPages();
        });
      }
    },
    created: function created() {
      var _this3 = this;

      this.setNumPages(); // For SSR, assuming a page URL can be detected

      this.$nextTick(function () {
        _this3.guessCurrentPage();
      });
    },
    mounted: function mounted() {
      var _this4 = this;

      if (this.$router) {
        // We only add the watcher if vue router is detected
        this.$watch('$route', function (to, from) {
          _this4.$nextTick(function () {
            requestAF(function () {
              _this4.guessCurrentPage();
            });
          });
        });
      }
    },
    methods: {
      setNumPages: function setNumPages() {
        if (isArray$1(this.pages) && this.pages.length > 0) {
          this.localNumPages = this.pages.length;
        } else {
          this.localNumPages = sanitizeNumPages(this.numberOfPages);
        }
      },
      onClick: function onClick(pageNum, evt) {
        var _this5 = this;

        // Dont do anything if clicking the current active page
        if (pageNum === this.currentPage) {
          return;
        }

        requestAF(function () {
          // Update the v-model
          // Done in in requestAF() to allow browser to complete the
          // native browser click handling of a link
          _this5.currentPage = pageNum;

          _this5.$emit('change', pageNum);
        });
        this.$nextTick(function () {
          // Done in a nextTick() to ensure rendering complete
          try {
            // Emulate native link click page reloading behaviour by blurring the
            // paginator and returning focus to the document
            var target = evt.currentTarget || evt.target;
            target.blur();
          } catch (e) {}
        });
      },
      getPageInfo: function getPageInfo(pageNum) {
        if (!isArray$1(this.pages) || this.pages.length === 0 || isUndefined(this.pages[pageNum - 1])) {
          var link = "".concat(this.baseUrl).concat(pageNum);
          return {
            link: this.useRouter ? {
              path: link
            } : link,
            text: toString$1(pageNum)
          };
        }

        var info = this.pages[pageNum - 1];

        if (isObject(info)) {
          var _link = info.link;
          return {
            // Normalize link for router use
            link: isObject(_link) ? _link : this.useRouter ? {
              path: _link
            } : _link,
            // Make sure text has a value
            text: toString$1(info.text || pageNum)
          };
        } else {
          return {
            link: toString$1(info),
            text: toString$1(pageNum)
          };
        }
      },
      makePage: function makePage(pageNum) {
        var info = this.getPageInfo(pageNum);

        if (this.pageGen && isFunction(this.pageGen)) {
          return this.pageGen(pageNum, info);
        }

        return info.text;
      },
      makeLink: function makeLink(pageNum) {
        var info = this.getPageInfo(pageNum);

        if (this.linkGen && isFunction(this.linkGen)) {
          return this.linkGen(pageNum, info);
        }

        return info.link;
      },
      linkProps: function linkProps(pageNum) {
        var link = this.makeLink(pageNum);
        var props = {
          target: this.target || null,
          rel: this.rel || null,
          disabled: this.disabled,
          // The following props are only used if BLink detects router
          exact: this.exact,
          activeClass: this.activeClass,
          exactActiveClass: this.exactActiveClass,
          append: this.append,
          replace: this.replace,
          // nuxt-link specific prop
          noPrefetch: this.noPrefetch
        };

        if (this.useRouter || isObject(link)) {
          props.to = link;
        } else {
          props.href = link;
        }

        return props;
      },
      resolveLink: function resolveLink() {
        var to = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        // Given a to (or href string), convert to normalized route-like structure
        // Works only client side!!
        var link;

        try {
          // Convert the `to` to a HREF via a temporary `a` tag
          link = document.createElement('a');
          link.href = computeHref({
            to: to
          }, 'a', '/', '/'); // We need to add the anchor to the document to make sure the
          // `pathname` is correctly detected in any browser (i.e. IE)

          document.body.appendChild(link); // Once href is assigned, the link will be normalized to the full URL bits

          var _link2 = link,
              pathname = _link2.pathname,
              hash = _link2.hash,
              search = _link2.search; // Remove link from document

          document.body.removeChild(link); // Return the location in a route-like object

          return {
            path: pathname,
            hash: hash,
            query: parseQuery(search)
          };
        } catch (e) {
          /* istanbul ignore next */
          try {
            link && link.parentNode && link.parentNode.removeChild(link);
          } catch (e) {}
          /* istanbul ignore next */


          return {};
        }
      },
      resolveRoute: function resolveRoute() {
        var to = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

        // Given a to (or href string), convert to normalized route location structure
        // works only when router available!!
        try {
          var route = this.$router.resolve(to, this.$route).route;
          return {
            path: route.path,
            hash: route.hash,
            query: route.query
          };
        } catch (e) {
          /* istanbul ignore next */
          return {};
        }
      },
      guessCurrentPage: function guessCurrentPage() {
        var guess = this.computedValue;
        var $router = this.$router;
        var $route = this.$route; // This section only occurs if we are client side, or server-side with $router

        /* istanbul ignore else */

        if (!this.noPageDetect && !guess && (isBrowser || !isBrowser && $router)) {
          // Current route (if router available)
          var currRoute = $router && $route ? {
            path: $route.path,
            hash: $route.hash,
            query: $route.query
          } : {}; // Current page full HREF (if client side). Can't be done as a computed prop!

          var loc = isBrowser ? window.location || document.location : null;
          var currLink = loc ? {
            path: loc.pathname,
            hash: loc.hash,
            query: parseQuery(loc.search)
          } : {}; // Loop through the possible pages looking for a match until found

          for (var page = 1; !guess && page <= this.localNumPages; page++) {
            var to = this.makeLink(page);

            if ($router && (isObject(to) || this.useRouter)) {
              // Resolve the page via the $router
              guess = looseEqual(this.resolveRoute(to), currRoute) ? page : null;
            } else if (isBrowser) {
              // If no $router available (or !this.useRouter when `to` is a string)
              // we compare using parsed URIs
              guess = looseEqual(this.resolveLink(to), currLink) ? page : null;
            } else {
              // probably SSR, but no $router so we can't guess, so lets break out of
              // the loop early

              /* istanbul ignore next */
              guess = -1;
            }
          }
        } // We set currentPage to 0 to trigger an $emit('input', null)
        // As the default for this.currentPage is -1 when no value is specified
        // And valid page numbers are greater than 0


        this.currentPage = guess > 0 ? guess : 0;
      }
    }
  });

  var components$u = {
    BPaginationNav: BPaginationNav
  };
  var index$r = {
    install: installFactory({
      components: components$u
    })
  };

  var NAME$e = 'tooltip';
  var CLASS_PREFIX = 'bs-tooltip';
  var BS_CLASS_PREFIX_REGEX = new RegExp("\\b".concat(CLASS_PREFIX, "\\S+"), 'g');
  var TRANSITION_DURATION = 150; // Modal $root hidden event

  var MODAL_CLOSE_EVENT = 'bv::modal::hidden'; // Modal container for appending tooltip/popover

  var MODAL_CLASS = '.modal-content';
  var AttachmentMap$1 = {
    AUTO: 'auto',
    TOP: 'top',
    RIGHT: 'right',
    BOTTOM: 'bottom',
    LEFT: 'left',
    TOPLEFT: 'top',
    TOPRIGHT: 'top',
    RIGHTTOP: 'right',
    RIGHTBOTTOM: 'right',
    BOTTOMLEFT: 'bottom',
    BOTTOMRIGHT: 'bottom',
    LEFTTOP: 'left',
    LEFTBOTTOM: 'left'
  };
  var OffsetMap = {
    AUTO: 0,
    TOPLEFT: -1,
    TOP: 0,
    TOPRIGHT: +1,
    RIGHTTOP: -1,
    RIGHT: 0,
    RIGHTBOTTOM: +1,
    BOTTOMLEFT: -1,
    BOTTOM: 0,
    BOTTOMRIGHT: +1,
    LEFTTOP: -1,
    LEFT: 0,
    LEFTBOTTOM: +1
  };
  var HoverState = {
    SHOW: 'show',
    OUT: 'out'
  };
  var ClassName = {
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector$2 = {
    TOOLTIP: '.tooltip',
    TOOLTIP_INNER: '.tooltip-inner',
    ARROW: '.arrow'
  };
  var Defaults$1 = {
    animation: true,
    template: '<div class="tooltip" role="tooltip">' + '<div class="arrow"></div>' + '<div class="tooltip-inner"></div>' + '</div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    placement: 'top',
    offset: 0,
    arrowPadding: 6,
    container: false,
    fallbackPlacement: 'flip',
    callbacks: {},
    boundary: 'scrollParent' // Transition event names

  };
  var TransitionEndEvents$1 = {
    WebkitTransition: ['webkitTransitionEnd'],
    MozTransition: ['transitionend'],
    OTransition: ['otransitionend', 'oTransitionEnd'],
    transition: ['transitionend'] // Options for Native Event Listeners (since we never call preventDefault)

  };
  var EvtOpts = {
    passive: true,
    capture: false // Client-side tip ID counter for aria-describedby attribute
    // Each tooltip requires a unique client side ID

  };
  var NEXTID = 1;
  /* istanbul ignore next */

  var generateId = function generateId(name) {
    return "__BV_".concat(name, "_").concat(NEXTID++, "__");
  };
  /*
   * ToolTip class definition
   */


  var ToolTip =
  /*#__PURE__*/
  function () {
    // Main constructor
    function ToolTip(element, config, $root) {
      _classCallCheck(this, ToolTip);

      // New tooltip object
      this.$isEnabled = true;
      this.$fadeTimeout = null;
      this.$hoverTimeout = null;
      this.$visibleInterval = null;
      this.$hoverState = '';
      this.$activeTrigger = {};
      this.$popper = null;
      this.$element = element;
      this.$tip = null;
      this.$id = generateId(this.constructor.NAME);
      this.$root = $root || null;
      this.$routeWatcher = null; // We use a bound version of the following handlers for root/modal
      // listeners to maintain the 'this' context

      this.$forceHide = this.forceHide.bind(this);
      this.$doHide = this.doHide.bind(this);
      this.$doShow = this.doShow.bind(this);
      this.$doDisable = this.doDisable.bind(this);
      this.$doEnable = this.doEnable.bind(this);
      this._noop = noop.bind(this); // Set the configuration

      this.updateConfig(config);
    } // NOTE: Overridden by PopOver class


    _createClass(ToolTip, [{
      key: "updateConfig",
      // Update config
      value: function updateConfig(config) {
        // Merge config into defaults. We use "this" here because PopOver overrides Default
        var updatedConfig = _objectSpread({}, this.constructor.Default, config); // Sanitize delay


        if (config.delay && isNumber(config.delay)) {
          /* istanbul ignore next */
          updatedConfig.delay = {
            show: config.delay,
            hide: config.delay
          };
        } // Title for tooltip and popover


        if (config.title && isNumber(config.title)) {
          /* istanbul ignore next */
          updatedConfig.title = config.title.toString();
        } // Content only for popover


        if (config.content && isNumber(config.content)) {
          /* istanbul ignore next */
          updatedConfig.content = config.content.toString();
        } // Hide element original title if needed


        this.fixTitle(); // Update the config

        this.$config = updatedConfig; // Stop/Restart listening

        this.unListen();
        this.listen();
      } // Destroy this instance

    }, {
      key: "destroy",
      value: function destroy() {
        // Stop listening to trigger events
        this.unListen(); // Disable while open listeners/watchers

        this.setWhileOpenListeners(false); // Clear any timeouts

        clearTimeout(this.$hoverTimeout);
        this.$hoverTimeout = null;
        clearTimeout(this.$fadeTimeout);
        this.$fadeTimeout = null; // Remove popper

        if (this.$popper) {
          this.$popper.destroy();
        }

        this.$popper = null; // Remove tip from document

        if (this.$tip && this.$tip.parentElement) {
          this.$tip.parentElement.removeChild(this.$tip);
        }

        this.$tip = null; // Null out other properties

        this.$id = null;
        this.$isEnabled = null;
        this.$root = null;
        this.$element = null;
        this.$config = null;
        this.$hoverState = null;
        this.$activeTrigger = null;
        this.$forceHide = null;
        this.$doHide = null;
        this.$doShow = null;
        this.$doDisable = null;
        this.$doEnable = null;
      }
    }, {
      key: "enable",
      value: function enable() {
        // Create a non-cancelable BvEvent
        var enabledEvt = new BvEvent('enabled', {
          cancelable: false,
          target: this.$element,
          relatedTarget: null
        });
        this.$isEnabled = true;
        this.emitEvent(enabledEvt);
      }
    }, {
      key: "disable",
      value: function disable() {
        // Create a non-cancelable BvEvent
        var disabledEvt = new BvEvent('disabled', {
          cancelable: false,
          target: this.$element,
          relatedTarget: null
        });
        this.$isEnabled = false;
        this.emitEvent(disabledEvt);
      } // Click toggler

    }, {
      key: "toggle",
      value: function toggle(event) {
        if (!this.$isEnabled) {
          /* istanbul ignore next */
          return;
        }
        /* istanbul ignore else */


        if (event) {
          this.$activeTrigger.click = !this.$activeTrigger.click;

          if (this.isWithActiveTrigger()) {
            this.enter(null);
          } else {
            this.leave(null);
          }
        } else {
          if (hasClass(this.getTipElement(), ClassName.SHOW)) {
            this.leave(null);
          } else {
            this.enter(null);
          }
        }
      } // Show tooltip

    }, {
      key: "show",
      value: function show() {
        var _this = this;

        if (!document.body.contains(this.$element) || !isVisible(this.$element)) {
          // If trigger element isn't in the DOM or is not visible
          return;
        } // Build tooltip element (also sets this.$tip)


        var tip = this.getTipElement();
        this.fixTitle();
        this.setContent(tip);

        if (!this.isWithContent(tip)) {
          // If no content, don't bother showing

          /* istanbul ignore next */
          this.$tip = null;
          /* istanbul ignore next */

          return;
        } // Set ID on tip and aria-describedby on element


        setAttr(tip, 'id', this.$id);
        this.addAriaDescribedby(); // Set animation on or off

        if (this.$config.animation) {
          addClass(tip, ClassName.FADE);
        } else {
          removeClass(tip, ClassName.FADE);
        }

        var placement = this.getPlacement();
        var attachment = this.constructor.getAttachment(placement);
        this.addAttachmentClass(attachment); // Create a cancelable BvEvent

        var showEvt = new BvEvent('show', {
          cancelable: true,
          target: this.$element,
          relatedTarget: tip
        });
        this.emitEvent(showEvt);

        if (showEvt.defaultPrevented) {
          // Don't show if event cancelled
          this.$tip = null;
          return;
        } // Insert tooltip if needed


        var container = this.getContainer();

        if (!document.body.contains(tip)) {
          container.appendChild(tip);
        } // Refresh popper


        this.removePopper();
        this.$popper = new Popper(this.$element, tip, this.getPopperConfig(placement, tip)); // Transitionend callback

        var complete = function complete() {
          if (_this.$config.animation) {
            _this.fixTransition(tip);
          }

          var prevHoverState = _this.$hoverState;
          _this.$hoverState = null;

          if (prevHoverState === HoverState.OUT) {
            _this.leave(null);
          } // Create a non-cancelable BvEvent


          var shownEvt = new BvEvent('shown', {
            cancelable: false,
            target: _this.$element,
            relatedTarget: tip
          });

          _this.emitEvent(shownEvt);
        }; // Enable while open listeners/watchers


        this.setWhileOpenListeners(true); // Show tip

        addClass(tip, ClassName.SHOW); // Start the transition/animation

        this.transitionOnce(tip, complete);
      } // Handler for periodic visibility check

    }, {
      key: "visibleCheck",
      value: function visibleCheck(on) {
        var _this2 = this;

        clearInterval(this.$visibleInterval);
        this.$visibleInterval = null;

        if (on) {
          this.$visibleInterval = setInterval(function () {
            var tip = _this2.$tip;

            if (tip && !isVisible(_this2.$element) && hasClass(tip, ClassName.SHOW)) {
              // Element is no longer visible, so force-hide the tooltip
              _this2.forceHide();
            }
          }, 100);
        }
      }
    }, {
      key: "setWhileOpenListeners",
      value: function setWhileOpenListeners(on) {
        // Modal close events
        this.setModalListener(on); // Periodic $element visibility check
        // For handling when tip is in <keepalive>, tabs, carousel, etc

        this.visibleCheck(on); // Route change events

        this.setRouteWatcher(on); // On-touch start listeners

        this.setOnTouchStartListener(on);

        if (on && /(focus|blur)/.test(this.$config.trigger)) {
          // If focus moves between trigger element and tip container, don't close
          eventOn(this.$tip, 'focusout', this, EvtOpts);
        } else {
          eventOff(this.$tip, 'focusout', this, EvtOpts);
        }
      } // Force hide of tip (internal method)

    }, {
      key: "forceHide",
      value: function forceHide() {
        if (!this.$tip || !hasClass(this.$tip, ClassName.SHOW)) {
          /* istanbul ignore next */
          return;
        } // Disable while open listeners/watchers


        this.setWhileOpenListeners(false); // Clear any hover enter/leave event

        clearTimeout(this.$hoverTimeout);
        this.$hoverTimeout = null;
        this.$hoverState = ''; // Hide the tip

        this.hide(null, true);
      } // Hide tooltip

    }, {
      key: "hide",
      value: function hide(callback, force) {
        var _this3 = this;

        var tip = this.$tip;

        if (!tip) {
          /* istanbul ignore next */
          return;
        } // Create a cancelable BvEvent


        var hideEvt = new BvEvent('hide', {
          // We disable cancelling if force is true
          cancelable: !force,
          target: this.$element,
          relatedTarget: tip
        });
        this.emitEvent(hideEvt);

        if (hideEvt.defaultPrevented) {
          // Don't hide if event cancelled
          return;
        } // Transitionend callback


        var complete = function complete() {
          if (_this3.$hoverState !== HoverState.SHOW && tip.parentNode) {
            // Remove tip from DOM, and force recompile on next show
            tip.parentNode.removeChild(tip);

            _this3.removeAriaDescribedby();

            _this3.removePopper();

            _this3.$tip = null;
          }

          if (callback) {
            callback();
          } // Create a non-cancelable BvEvent


          var hiddenEvt = new BvEvent('hidden', {
            cancelable: false,
            target: _this3.$element,
            relatedTarget: null
          });

          _this3.emitEvent(hiddenEvt);
        }; // Disable while open listeners/watchers


        this.setWhileOpenListeners(false); // If forced close, disable animation

        if (force) {
          removeClass(tip, ClassName.FADE);
        } // Hide tip


        removeClass(tip, ClassName.SHOW);
        this.$activeTrigger.click = false;
        this.$activeTrigger.focus = false;
        this.$activeTrigger.hover = false; // Start the hide transition

        this.transitionOnce(tip, complete);
        this.$hoverState = '';
      }
    }, {
      key: "emitEvent",
      value: function emitEvent(evt) {
        var evtName = evt.type;

        if (this.$root && this.$root.$emit) {
          // Emit an event on $root
          this.$root.$emit("bv::".concat(this.constructor.NAME, "::").concat(evtName), evt);
        }

        var callbacks = this.$config.callbacks || {};

        if (isFunction(callbacks[evtName])) {
          callbacks[evtName](evt);
        }
      }
    }, {
      key: "getContainer",
      value: function getContainer() {
        var container = this.$config.container;
        var body = document.body; // If we are in a modal, we append to the modal instead of body,
        // unless a container is specified

        return container === false ? closest(MODAL_CLASS, this.$element) || body : select(container, body) || body;
      } // Will be overridden by PopOver if needed

    }, {
      key: "addAriaDescribedby",
      value: function addAriaDescribedby() {
        // Add aria-describedby on trigger element, without removing any other IDs
        var desc = getAttr(this.$element, 'aria-describedby') || '';
        desc = desc.split(/\s+/).concat(this.$id).join(' ').trim();
        setAttr(this.$element, 'aria-describedby', desc);
      } // Will be overridden by PopOver if needed

    }, {
      key: "removeAriaDescribedby",
      value: function removeAriaDescribedby() {
        var _this4 = this;

        var desc = getAttr(this.$element, 'aria-describedby') || '';
        desc = desc.split(/\s+/).filter(function (d) {
          return d !== _this4.$id;
        }).join(' ').trim();

        if (desc) {
          /* istanbul ignore next */
          setAttr(this.$element, 'aria-describedby', desc);
        } else {
          removeAttr(this.$element, 'aria-describedby');
        }
      }
    }, {
      key: "removePopper",
      value: function removePopper() {
        if (this.$popper) {
          this.$popper.destroy();
        }

        this.$popper = null;
      }
    }, {
      key: "transitionOnce",
      value: function transitionOnce(tip, complete) {
        var _this5 = this;

        var transEvents = this.getTransitionEndEvents();
        var called = false;
        clearTimeout(this.$fadeTimeout);
        this.$fadeTimeout = null;

        var fnOnce = function fnOnce() {
          if (called) {
            /* istanbul ignore next */
            return;
          }

          called = true;
          clearTimeout(_this5.$fadeTimeout);
          _this5.$fadeTimeout = null;
          transEvents.forEach(function (evtName) {
            eventOff(tip, evtName, fnOnce, EvtOpts);
          }); // Call complete callback

          complete();
        };

        if (hasClass(tip, ClassName.FADE)) {
          transEvents.forEach(function (evtName) {
            eventOn(tip, evtName, fnOnce, EvtOpts);
          }); // Fallback to setTimeout()

          this.$fadeTimeout = setTimeout(fnOnce, TRANSITION_DURATION);
        } else {
          fnOnce();
        }
      } // What transitionend event(s) to use? (returns array of event names)

    }, {
      key: "getTransitionEndEvents",
      value: function getTransitionEndEvents() {
        for (var name in TransitionEndEvents$1) {
          if (!isUndefined(this.$element.style[name])) {
            return TransitionEndEvents$1[name];
          }
        } // Fallback

        /* istanbul ignore next */


        return [];
      }
      /* istanbul ignore next */

    }, {
      key: "update",
      value: function update() {
        if (!isNull(this.$popper)) {
          this.$popper.scheduleUpdate();
        }
      } // NOTE: Overridden by PopOver class

    }, {
      key: "isWithContent",
      value: function isWithContent(tip) {
        tip = tip || this.$tip;

        if (!tip) {
          /* istanbul ignore next */
          return false;
        }

        return Boolean((select(Selector$2.TOOLTIP_INNER, tip) || {}).innerHTML);
      } // NOTE: Overridden by PopOver class

    }, {
      key: "addAttachmentClass",
      value: function addAttachmentClass(attachment) {
        addClass(this.getTipElement(), "".concat(CLASS_PREFIX, "-").concat(attachment));
      }
    }, {
      key: "getTipElement",
      value: function getTipElement() {
        if (!this.$tip) {
          // Try and compile user supplied template, or fallback to default template
          this.$tip = this.compileTemplate(this.$config.template) || this.compileTemplate(this.constructor.Default.template);
        } // Add tab index so tip can be focused, and to allow it to be
        // set as relatedTarget in focusin/out events


        this.$tip.tabIndex = -1;
        return this.$tip;
      }
    }, {
      key: "compileTemplate",
      value: function compileTemplate(html) {
        if (!html || !isString(html)) {
          /* istanbul ignore next */
          return null;
        }

        var div = document.createElement('div');
        div.innerHTML = html.trim();
        var node = div.firstElementChild ? div.removeChild(div.firstElementChild) : null;
        div = null;
        return node;
      } // NOTE: Overridden by PopOver class

    }, {
      key: "setContent",
      value: function setContent(tip) {
        this.setElementContent(select(Selector$2.TOOLTIP_INNER, tip), this.getTitle());
        removeClass(tip, ClassName.FADE);
        removeClass(tip, ClassName.SHOW);
      }
    }, {
      key: "setElementContent",
      value: function setElementContent(container, content) {
        if (!container) {
          // If container element doesn't exist, just return

          /* istanbul ignore next */
          return;
        }

        var allowHtml = this.$config.html;

        if (isObject(content) && content.nodeType) {
          // Content is a DOM node
          if (allowHtml) {
            if (content.parentElement !== container) {
              container.innerHTML = '';
              container.appendChild(content);
            }
          } else {
            /* istanbul ignore next */
            container.innerText = content.innerText;
          }
        } else {
          // We have a plain HTML string or Text
          container[allowHtml ? 'innerHTML' : 'innerText'] = content;
        }
      } // NOTE: Overridden by PopOver class

    }, {
      key: "getTitle",
      value: function getTitle() {
        var title = this.$config.title || '';

        if (isFunction(title)) {
          // Call the function to get the title value

          /* istanbul ignore next */
          title = title(this.$element);
        }

        if (isObject(title) && title.nodeType && !title.innerHTML.trim()) {
          // We have a DOM node, but without inner content,
          // so just return empty string

          /* istanbul ignore next */
          title = '';
        }

        if (isString(title)) {
          title = title.trim();
        }

        if (!title) {
          // If an explicit title is not given, try element's title attributes
          title = getAttr(this.$element, 'title') || getAttr(this.$element, 'data-original-title') || '';
          title = title.trim();
        }

        return title;
      }
    }, {
      key: "listen",
      value: function listen() {
        var _this6 = this;

        var triggers = this.$config.trigger.trim().split(/\s+/);
        var el = this.$element; // Listen for global show/hide events

        this.setRootListener(true); // Using 'this' as the handler will get automatically directed to
        // this.handleEvent and maintain our binding to 'this'

        triggers.forEach(function (trigger) {
          if (trigger === 'click') {
            eventOn(el, 'click', _this6, EvtOpts);
          } else if (trigger === 'focus') {
            eventOn(el, 'focusin', _this6, EvtOpts);
            eventOn(el, 'focusout', _this6, EvtOpts);
          } else if (trigger === 'blur') {
            // Used to close $tip when element looses focus
            eventOn(el, 'focusout', _this6, EvtOpts);
          } else if (trigger === 'hover') {
            eventOn(el, 'mouseenter', _this6, EvtOpts);
            eventOn(el, 'mouseleave', _this6, EvtOpts);
          }
        }, this);
      }
    }, {
      key: "unListen",
      value: function unListen() {
        var _this7 = this;

        var events = ['click', 'focusin', 'focusout', 'mouseenter', 'mouseleave']; // Using "this" as the handler will get automatically directed to this.handleEvent

        events.forEach(function (evt) {
          eventOff(_this7.$element, evt, _this7, EvtOpts);
        }, this); // Stop listening for global show/hide/enable/disable events

        this.setRootListener(false);
      }
    }, {
      key: "handleEvent",
      value: function handleEvent(e) {
        // This special method allows us to use "this" as the event handlers
        if (isDisabled(this.$element)) {
          // If disabled, don't do anything. Note: If tip is shown before element gets
          // disabled, then tip not close until no longer disabled or forcefully closed.

          /* istanbul ignore next */
          return;
        }

        if (!this.$isEnabled) {
          // If not enable
          return;
        }

        var type = e.type;
        var target = e.target;
        var relatedTarget = e.relatedTarget;
        var $element = this.$element;
        var $tip = this.$tip;

        if (type === 'click') {
          this.toggle(e);
        } else if (type === 'focusin' || type === 'mouseenter') {
          this.enter(e);
        } else if (type === 'focusout') {
          // target is the element which is loosing focus
          // and relatedTarget is the element gaining focus
          if ($tip && $element && $element.contains(target) && $tip.contains(relatedTarget)) {
            // If focus moves from $element to $tip, don't trigger a leave

            /* istanbul ignore next */
            return;
          }

          if ($tip && $element && $tip.contains(target) && $element.contains(relatedTarget)) {
            // If focus moves from $tip to $element, don't trigger a leave

            /* istanbul ignore next */
            return;
          }
          /* istanbul ignore next: difficult to test */


          if ($tip && $tip.contains(target) && $tip.contains(relatedTarget)) {
            // If focus moves within $tip, don't trigger a leave
            return;
          }
          /* istanbul ignore next: difficult to test */


          if ($element && $element.contains(target) && $element.contains(relatedTarget)) {
            // If focus moves within $element, don't trigger a leave
            return;
          } // Otherwise trigger a leave


          this.leave(e);
        } else if (type === 'mouseleave') {
          this.leave(e);
        }
      }
      /* istanbul ignore next */

    }, {
      key: "setRouteWatcher",
      value: function setRouteWatcher(on) {
        var _this8 = this;

        if (on) {
          this.setRouteWatcher(false);

          if (this.$root && Boolean(this.$root.$route)) {
            this.$routeWatcher = this.$root.$watch('$route', function (newVal, oldVal) {
              if (newVal === oldVal) {
                return;
              } // If route has changed, we force hide the tooltip/popover


              _this8.forceHide();
            });
          }
        } else {
          if (this.$routeWatcher) {
            // Cancel the route watcher by calling the stored reference
            this.$routeWatcher();
            this.$routeWatcher = null;
          }
        }
      }
      /* istanbul ignore next */

    }, {
      key: "setModalListener",
      value: function setModalListener(on) {
        var modal = closest(MODAL_CLASS, this.$element);

        if (!modal) {
          // If we are not in a modal, don't worry. be happy
          return;
        } // We can listen for modal hidden events on $root


        if (this.$root) {
          this.$root[on ? '$on' : '$off'](MODAL_CLOSE_EVENT, this.$forceHide);
        }
      }
    }, {
      key: "setRootListener",
      value: function setRootListener(on) {
        // Listen for global 'bv::{hide|show}::{tooltip|popover}' hide request event
        if (this.$root) {
          this.$root[on ? '$on' : '$off']("bv::hide::".concat(this.constructor.NAME), this.$doHide);
          this.$root[on ? '$on' : '$off']("bv::show::".concat(this.constructor.NAME), this.$doShow);
          this.$root[on ? '$on' : '$off']("bv::disable::".concat(this.constructor.NAME), this.$doDisable);
          this.$root[on ? '$on' : '$off']("bv::enable::".concat(this.constructor.NAME), this.$doEnable);
        }
      }
    }, {
      key: "doHide",
      value: function doHide(id) {
        // Programmatically hide tooltip or popover
        if (!id) {
          // Close all tooltips or popovers
          this.forceHide();
        } else if (this.$element && this.$element.id && this.$element.id === id) {
          // Close this specific tooltip or popover
          this.hide();
        }
      }
    }, {
      key: "doShow",
      value: function doShow(id) {
        // Programmatically show tooltip or popover
        if (!id) {
          // Open all tooltips or popovers
          this.show();
        } else if (id && this.$element && this.$element.id && this.$element.id === id) {
          // Show this specific tooltip or popover
          this.show();
        }
      }
    }, {
      key: "doDisable",
      value: function doDisable(id) {
        // Programmatically disable tooltip or popover
        if (!id) {
          // Disable all tooltips or popovers
          this.disable();
        } else if (this.$element && this.$element.id && this.$element.id === id) {
          // Disable this specific tooltip or popover
          this.disable();
        }
      }
    }, {
      key: "doEnable",
      value: function doEnable(id) {
        // Programmatically enable tooltip or popover
        if (!id) {
          // Enable all tooltips or popovers
          this.enable();
        } else if (this.$element && this.$element.id && this.$element.id === id) {
          // Enable this specific tooltip or popover
          this.enable();
        }
      }
    }, {
      key: "setOnTouchStartListener",
      value: function setOnTouchStartListener(on) {
        var _this9 = this;

        // If this is a touch-enabled device we add extra
        // empty mouseover listeners to the body's immediate children
        // Only needed because of broken event delegation on iOS
        // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
        if ('ontouchstart' in document.documentElement) {
          /* istanbul ignore next: JSDOM does not support 'ontouchstart' event */
          from(document.body.children).forEach(function (el) {
            if (on) {
              eventOn(el, 'mouseover', _this9._noop);
            } else {
              eventOff(el, 'mouseover', _this9._noop);
            }
          });
        }
      }
    }, {
      key: "fixTitle",
      value: function fixTitle() {
        var el = this.$element;

        if (getAttr(el, 'title') || !isString(getAttr(el, 'data-original-title'))) {
          setAttr(el, 'data-original-title', getAttr(el, 'title') || '');
          setAttr(el, 'title', '');
        }
      } // Enter handler

    }, {
      key: "enter",
      value: function enter(e) {
        var _this10 = this;

        if (e) {
          this.$activeTrigger[e.type === 'focusin' ? 'focus' : 'hover'] = true;
        }

        if (hasClass(this.getTipElement(), ClassName.SHOW) || this.$hoverState === HoverState.SHOW) {
          this.$hoverState = HoverState.SHOW;
          return;
        }

        clearTimeout(this.$hoverTimeout);
        this.$hoverState = HoverState.SHOW;

        if (!this.$config.delay || !this.$config.delay.show) {
          this.show();
          return;
        }

        this.$hoverTimeout = setTimeout(function () {
          if (_this10.$hoverState === HoverState.SHOW) {
            _this10.show();
          }
        }, this.$config.delay.show);
      } // Leave handler

    }, {
      key: "leave",
      value: function leave(e) {
        var _this11 = this;

        if (e) {
          this.$activeTrigger[e.type === 'focusout' ? 'focus' : 'hover'] = false;

          if (e.type === 'focusout' && /blur/.test(this.$config.trigger)) {
            // Special case for `blur`: we clear out the other triggers
            this.$activeTrigger.click = false;
            this.$activeTrigger.hover = false;
          }
        }

        if (this.isWithActiveTrigger()) {
          return;
        }

        clearTimeout(this.$hoverTimeout);
        this.$hoverState = HoverState.OUT;

        if (!this.$config.delay || !this.$config.delay.hide) {
          this.hide();
          return;
        }

        this.$hoverTimeout = setTimeout(function () {
          if (_this11.$hoverState === HoverState.OUT) {
            _this11.hide();
          }
        }, this.$config.delay.hide);
      }
    }, {
      key: "getPopperConfig",
      value: function getPopperConfig(placement, tip) {
        var _this12 = this;

        return {
          placement: this.constructor.getAttachment(placement),
          modifiers: {
            offset: {
              offset: this.getOffset(placement, tip)
            },
            flip: {
              behavior: this.$config.fallbackPlacement
            },
            arrow: {
              element: '.arrow'
            },
            preventOverflow: {
              padding: this.$config.boundaryPadding,
              boundariesElement: this.$config.boundary
            }
          },
          onCreate: function onCreate(data) {
            // Handle flipping arrow classes

            /* istanbul ignore next */
            if (data.originalPlacement !== data.placement) {
              _this12.handlePopperPlacementChange(data);
            }
          },
          onUpdate: function onUpdate(data) {
            // Handle flipping arrow classes

            /* istanbul ignore next */
            _this12.handlePopperPlacementChange(data);
          }
        };
      }
      /* istanbul ignore next */

    }, {
      key: "getOffset",
      value: function getOffset(placement, tip) {
        if (!this.$config.offset) {
          var arrow = select(Selector$2.ARROW, tip);
          var arrowOffset = parseFloat(getCS(arrow).width) + parseFloat(this.$config.arrowPadding);

          switch (OffsetMap[placement.toUpperCase()]) {
            case +1:
              return "+50%p - ".concat(arrowOffset, "px");

            case -1:
              return "-50%p + ".concat(arrowOffset, "px");

            default:
              return 0;
          }
        }

        return this.$config.offset;
      }
    }, {
      key: "getPlacement",
      value: function getPlacement() {
        var placement = this.$config.placement;

        if (isFunction(placement)) {
          /* istanbul ignore next */
          return placement.call(this, this.$tip, this.$element);
        }

        return placement;
      }
    }, {
      key: "isWithActiveTrigger",
      value: function isWithActiveTrigger() {
        for (var trigger in this.$activeTrigger) {
          if (this.$activeTrigger[trigger]) {
            return true;
          }
        }

        return false;
      } // NOTE: Overridden by PopOver class

      /* istanbul ignore next */

    }, {
      key: "cleanTipClass",
      value: function cleanTipClass() {
        var tip = this.getTipElement();
        var tabClass = tip.className.match(BS_CLASS_PREFIX_REGEX);

        if (!isNull(tabClass) && tabClass.length > 0) {
          tabClass.forEach(function (cls) {
            removeClass(tip, cls);
          });
        }
      }
      /* istanbul ignore next */

    }, {
      key: "handlePopperPlacementChange",
      value: function handlePopperPlacementChange(data) {
        this.cleanTipClass();
        this.addAttachmentClass(this.constructor.getAttachment(data.placement));
      }
      /* istanbul ignore next */

    }, {
      key: "fixTransition",
      value: function fixTransition(tip) {
        var initConfigAnimation = this.$config.animation || false;

        if (!isNull(getAttr(tip, 'x-placement'))) {
          return;
        }

        removeClass(tip, ClassName.FADE);
        this.$config.animation = false;
        this.hide();
        this.show();
        this.$config.animation = initConfigAnimation;
      }
    }], [{
      key: "getAttachment",
      value: function getAttachment(placement) {
        return AttachmentMap$1[placement.toUpperCase()];
      }
    }, {
      key: "Default",
      get: function get() {
        return Defaults$1;
      } // NOTE: Overridden by PopOver class

    }, {
      key: "NAME",
      get: function get() {
        return NAME$e;
      }
    }]);

    return ToolTip;
  }();

  var NAME$f = 'popover';
  var CLASS_PREFIX$1 = 'bs-popover';
  var BS_CLASS_PREFIX_REGEX$1 = new RegExp("\\b".concat(CLASS_PREFIX$1, "\\S+"), 'g');

  var Defaults$2 = _objectSpread({}, ToolTip.Default, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip">' + '<div class="arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div></div>'
  });

  var ClassName$1 = {
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector$3 = {
    TITLE: '.popover-header',
    CONTENT: '.popover-body'
  };

  var PopOver =
  /*#__PURE__*/
  function (_ToolTip) {
    _inherits(PopOver, _ToolTip);

    function PopOver() {
      _classCallCheck(this, PopOver);

      return _possibleConstructorReturn(this, _getPrototypeOf(PopOver).apply(this, arguments));
    }

    _createClass(PopOver, [{
      key: "isWithContent",
      // --- Method overrides ---
      value: function isWithContent(tip) {
        tip = tip || this.$tip;

        if (!tip) {
          /* istanbul ignore next */
          return false;
        }

        var hasTitle = Boolean((select(Selector$3.TITLE, tip) || {}).innerHTML);
        var hasContent = Boolean((select(Selector$3.CONTENT, tip) || {}).innerHTML);
        return hasTitle || hasContent;
      }
    }, {
      key: "addAttachmentClass",
      value: function addAttachmentClass(attachment)
      /* istanbul ignore next */
      {
        addClass(this.getTipElement(), "".concat(CLASS_PREFIX$1, "-").concat(attachment));
      }
    }, {
      key: "setContent",
      value: function setContent(tip) {
        // we use append for html objects to maintain js events/components
        this.setElementContent(select(Selector$3.TITLE, tip), this.getTitle());
        this.setElementContent(select(Selector$3.CONTENT, tip), this.getContent());
        removeClass(tip, ClassName$1.FADE);
        removeClass(tip, ClassName$1.SHOW);
      } // This method may look identical to ToolTip version, but it uses a different RegEx defined above

    }, {
      key: "cleanTipClass",
      value: function cleanTipClass()
      /* istanbul ignore next */
      {
        var tip = this.getTipElement();
        var tabClass = tip.className.match(BS_CLASS_PREFIX_REGEX$1);

        if (!isNull(tabClass) && tabClass.length > 0) {
          tabClass.forEach(function (cls) {
            removeClass(tip, cls);
          });
        }
      }
    }, {
      key: "getTitle",
      value: function getTitle() {
        var title = this.$config.title || '';
        /* istanbul ignore next */

        if (isFunction(title)) {
          title = title(this.$element);
        }
        /* istanbul ignore next */


        if (isObject(title) && title.nodeType && !title.innerHTML.trim()) {
          // We have a dom node, but without inner content, so just return an empty string
          title = '';
        }

        if (isString(title)) {
          title = title.trim();
        }

        if (!title) {
          // Try and grab element's title attribute
          title = getAttr(this.$element, 'title') || getAttr(this.$element, 'data-original-title') || '';
          title = title.trim();
        }

        return title;
      } // New methods

    }, {
      key: "getContent",
      value: function getContent() {
        var content = this.$config.content || '';
        /* istanbul ignore next */

        if (isFunction(content)) {
          content = content(this.$element);
        }
        /* istanbul ignore next */


        if (isObject(content) && content.nodeType && !content.innerHTML.trim()) {
          // We have a dom node, but without inner content, so just return an empty string
          content = '';
        }

        if (isString(content)) {
          content = content.trim();
        }

        return content;
      }
    }], [{
      key: "Default",
      // --- Getter overrides ---
      get: function get() {
        return Defaults$2;
      }
    }, {
      key: "NAME",
      get: function get() {
        return NAME$f;
      }
    }]);

    return PopOver;
  }(ToolTip);

  /**
   * SSR safe types
   */
  var w$1 = hasWindowSupport ? window : {};
  var HTMLElement = w$1.HTMLElement || Object;

  var PLACEMENTS = {
    top: 'top',
    topleft: 'topleft',
    topright: 'topright',
    right: 'right',
    righttop: 'righttop',
    rightbottom: 'rightbottom',
    bottom: 'bottom',
    bottomleft: 'bottomleft',
    bottomright: 'bottomright',
    left: 'left',
    lefttop: 'lefttop',
    leftbottom: 'leftbottom',
    auto: 'auto'
  };
  var OBSERVER_CONFIG$1 = {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class', 'style'] // @vue/component

  };
  var toolpopMixin = {
    props: {
      target: {
        // String ID of element, or element/component reference
        type: [String, Object, HTMLElement, Function] // default: undefined

      },
      delay: {
        type: [Number, Object, String],
        default: 0
      },
      offset: {
        type: [Number, String],
        default: 0
      },
      noFade: {
        type: Boolean,
        default: false
      },
      container: {
        // String ID of container, if null body is used (default)
        type: String,
        default: null
      },
      boundary: {
        // String: scrollParent, window, or viewport
        // Element: element reference
        type: [String, HTMLElement],
        default: 'scrollParent'
      },
      boundaryPadding: {
        type: Number,
        default: 5
      },
      show: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },
    data: function data() {
      return {
        // semaphore for preventing multiple show events
        localShow: false
      };
    },
    computed: {
      baseConfig: function baseConfig() {
        var cont = this.container;
        var delay = isObject(this.delay) ? this.delay : parseInt(this.delay, 10) || 0;
        return {
          // Title prop
          title: (this.title || '').trim() || '',
          // Content prop (if popover)
          content: (this.content || '').trim() || '',
          // Tooltip/Popover placement
          placement: PLACEMENTS[this.placement] || 'auto',
          // Container currently needs to be an ID with '#' prepended, if null then body is used
          container: cont ? /^#/.test(cont) ? cont : "#".concat(cont) : false,
          // boundariesElement passed to popper
          boundary: this.boundary,
          // boundariesElement padding passed to popper
          boundaryPadding: this.boundaryPadding,
          // Show/Hide delay
          delay: delay || 0,
          // Offset can be css distance. if no units, pixels are assumed
          offset: this.offset || 0,
          // Disable fade Animation?
          animation: !this.noFade,
          // Open/Close Trigger(s)
          trigger: isArray$1(this.triggers) ? this.triggers.join(' ') : this.triggers,
          // Callbacks so we can trigger events on component
          callbacks: {
            show: this.onShow,
            shown: this.onShown,
            hide: this.onHide,
            hidden: this.onHidden,
            enabled: this.onEnabled,
            disabled: this.onDisabled
          }
        };
      }
    },
    watch: {
      show: function show(_show, old) {
        if (_show !== old) {
          _show ? this.onOpen() : this.onClose();
        }
      },
      disabled: function disabled(_disabled, old) {
        if (_disabled !== old) {
          _disabled ? this.onDisable() : this.onEnable();
        }
      },
      localShow: function localShow(show, old) {
        if (show !== this.show) {
          this.$emit('update:show', show);
        }
      }
    },
    created: function created() {
      // Create non-reactive property
      this._toolpop = null;
      this._obs_title = null;
      this._obs_content = null;
    },
    mounted: function mounted() {
      var _this = this;

      // We do this in a next tick to ensure DOM has rendered first
      this.$nextTick(function () {
        // Instantiate ToolTip/PopOver on target
        // The createToolpop method must exist in main component
        if (_this.createToolpop()) {
          if (_this.disabled) {
            // Initially disabled
            _this.onDisable();
          } // Listen to open signals from others


          _this.$on('open', _this.onOpen); // Listen to close signals from others


          _this.$on('close', _this.onClose); // Listen to disable signals from others


          _this.$on('disable', _this.onDisable); // Listen to enable signals from others


          _this.$on('enable', _this.onEnable); // Observe content Child changes so we can notify popper of possible size change


          _this.setObservers(true); // Set initially open state


          if (_this.show) {
            _this.onOpen();
          }
        }
      });
    },
    updated: function updated() {
      // If content/props changes, etc
      if (this._toolpop) {
        this._toolpop.updateConfig(this.getConfig());
      }
    },
    activated: function activated()
    /* istanbul ignore next: can't easily test in JSDOM */
    {
      // Called when component is inside a <keep-alive> and component brought offline
      this.setObservers(true);
    },
    deactivated: function deactivated()
    /* istanbul ignore next: can't easily test in JSDOM */
    {
      // Called when component is inside a <keep-alive> and component taken offline
      if (this._toolpop) {
        this.setObservers(false);

        this._toolpop.hide();
      }
    },
    beforeDestroy: function beforeDestroy() {
      // Shutdown our local event listeners
      this.$off('open', this.onOpen);
      this.$off('close', this.onClose);
      this.$off('disable', this.onDisable);
      this.$off('enable', this.onEnable);
      this.setObservers(false); // bring our content back if needed

      this.bringItBack();

      if (this._toolpop) {
        this._toolpop.destroy();

        this._toolpop = null;
      }
    },
    methods: {
      getConfig: function getConfig() {
        var cfg = _objectSpread({}, this.baseConfig);

        if (this.$refs.title && this.$refs.title.innerHTML.trim()) {
          // If slot has content, it overrides 'title' prop
          // We use the DOM node as content to allow components!
          cfg.title = this.$refs.title;
          cfg.html = true;
        }

        if (this.$refs.content && this.$refs.content.innerHTML.trim()) {
          // If slot has content, it overrides 'content' prop
          // We use the DOM node as content to allow components!
          cfg.content = this.$refs.content;
          cfg.html = true;
        }

        return cfg;
      },
      onOpen: function onOpen() {
        if (this._toolpop && !this.localShow) {
          this.localShow = true;

          this._toolpop.show();
        }
      },
      onClose: function onClose(callback) {
        // What is callback for ? it is not documented

        /* istanbul ignore else */
        if (this._toolpop && this.localShow) {
          this._toolpop.hide(callback);
        } else if (isFunction(callback)) {
          // Is this even used?
          callback();
        }
      },
      onDisable: function onDisable() {
        if (this._toolpop) {
          this._toolpop.disable();
        }
      },
      onEnable: function onEnable() {
        if (this._toolpop) {
          this._toolpop.enable();
        }
      },
      updatePosition: function updatePosition() {
        /* istanbul ignore next: can't test in JSDOM until mutation observer is implemented */
        if (this._toolpop) {
          // Instruct popper to reposition popover if necessary
          this._toolpop.update();
        }
      },
      getTarget: function getTarget() {
        var target = this.target;

        if (isFunction(target)) {
          /* istanbul ignore next */
          target = target();
        }
        /* istanbul ignore else */


        if (isString(target)) {
          // Assume ID of element
          return getById(target);
        } else if (isObject(target) && isElement(target.$el)) {
          // Component reference

          /* istanbul ignore next */
          return target.$el;
        } else if (isObject(target) && isElement(target)) {
          // Element reference

          /* istanbul ignore next */
          return target;
        }
        /* istanbul ignore next */


        return null;
      },
      // Callbacks called by Tooltip/Popover class instance
      onShow: function onShow(evt) {
        this.$emit('show', evt);
        this.localShow = !(evt && evt.defaultPrevented);
      },
      onShown: function onShown(evt) {
        this.setObservers(true);
        this.$emit('shown', evt);
        this.localShow = true;
      },
      onHide: function onHide(evt) {
        this.$emit('hide', evt);
        this.localShow = !!(evt && evt.defaultPrevented);
      },
      onHidden: function onHidden(evt) {
        this.setObservers(false); // bring our content back if needed to keep Vue happy
        // Tooltip class will move it back to tip when shown again

        this.bringItBack();
        this.$emit('hidden', evt);
        this.localShow = false;
      },
      onEnabled: function onEnabled(evt) {
        /* istanbul ignore next */
        if (!evt || evt.type !== 'enabled') {
          // Prevent possible endless loop if user mistakenly fires enabled instead of enable
          return;
        }

        this.$emit('update:disabled', false);
        this.$emit('disabled');
      },
      onDisabled: function onDisabled(evt) {
        /* istanbul ignore next */
        if (!evt || evt.type !== 'disabled') {
          // Prevent possible endless loop if user mistakenly fires disabled instead of disable
          return;
        }

        this.$emit('update:disabled', true);
        this.$emit('enabled');
      },
      bringItBack: function bringItBack() {
        // bring our content back if needed to keep Vue happy
        if (this.$el && this.$refs.title) {
          this.$el.appendChild(this.$refs.title);
        }

        if (this.$el && this.$refs.content) {
          this.$el.appendChild(this.$refs.content);
        }
      },
      setObservers: function setObservers(on) {
        if (on) {
          if (this.$refs.title) {
            this._obs_title = observeDom(this.$refs.title, this.updatePosition.bind(this), OBSERVER_CONFIG$1);
          }

          if (this.$refs.content) {
            this._obs_content = observeDom(this.$refs.content, this.updatePosition.bind(this), OBSERVER_CONFIG$1);
          }
        } else {
          if (this._obs_title) {
            this._obs_title.disconnect();

            this._obs_title = null;
          }

          if (this._obs_content) {
            this._obs_content.disconnect();

            this._obs_content = null;
          }
        }
      }
    }
  };

  var props$S = {
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    triggers: {
      type: [String, Array],
      default: 'click'
    },
    placement: {
      type: String,
      default: 'right'
    } // @vue/component

  };
  var BPopover = Vue.extend({
    name: 'BPopover',
    mixins: [toolpopMixin],
    props: props$S,
    data: function data() {
      return {};
    },
    methods: {
      createToolpop: function createToolpop() {
        // getTarget is in toolpop mixin
        var target = this.getTarget();
        /* istanbul ignore else */

        if (target) {
          this._toolpop = new PopOver(target, this.getConfig(), this.$root);
        } else {
          this._toolpop = null;
          warn("b-popover: 'target' element not found!");
        }

        return this._toolpop;
      }
    },
    render: function render(h) {
      return h('div', {
        class: ['d-none'],
        style: {
          display: 'none'
        },
        attrs: {
          'aria-hidden': true
        }
      }, [h('div', {
        ref: 'title'
      }, this.$slots.title), h('div', {
        ref: 'content'
      }, this.$slots.default)]);
    }
  });

  var BV_POPOVER = '__BV_PopOver__'; // Valid event triggers

  var validTriggers = {
    focus: true,
    hover: true,
    click: true,
    blur: true // Build a PopOver config based on bindings (if any)
    // Arguments and modifiers take precedence over passed value config object

    /* istanbul ignore next: not easy to test */

  };

  var parseBindings = function parseBindings(bindings)
  /* istanbul ignore next: not easy to test */
  {
    // We start out with a blank config
    var config = {}; // Process bindings.value

    if (isString(bindings.value)) {
      // Value is popover content (html optionally supported)
      config.content = bindings.value;
    } else if (isFunction(bindings.value)) {
      // Content generator function
      config.content = bindings.value;
    } else if (isObject(bindings.value)) {
      // Value is config object, so merge
      config = _objectSpread({}, config, bindings.value);
    } // If argument, assume element ID of container element


    if (bindings.arg) {
      // Element ID specified as arg
      // We must prepend '#' to become a CSS selector
      config.container = "#".concat(bindings.arg);
    } // Process modifiers


    keys(bindings.modifiers).forEach(function (mod) {
      if (/^html$/.test(mod)) {
        // Title allows HTML
        config.html = true;
      } else if (/^nofade$/.test(mod)) {
        // no animation
        config.animation = false;
      } else if (/^(auto|top(left|right)?|bottom(left|right)?|left(top|bottom)?|right(top|bottom)?)$/.test(mod)) {
        // placement of popover
        config.placement = mod;
      } else if (/^(window|viewport)$/.test(mod)) {
        // Boundary of popover
        config.boundary = mod;
      } else if (/^d\d+$/.test(mod)) {
        // Delay value
        var delay = parseInt(mod.slice(1), 10) || 0;

        if (delay) {
          config.delay = delay;
        }
      } else if (/^o-?\d+$/.test(mod)) {
        // Offset value (negative allowed)
        var offset = parseInt(mod.slice(1), 10) || 0;

        if (offset) {
          config.offset = offset;
        }
      }
    }); // Special handling of event trigger modifiers trigger is
    // a space separated list

    var selectedTriggers = {}; // Parse current config object trigger

    var triggers = isString(config.trigger) ? config.trigger.trim().split(/\s+/) : [];
    triggers.forEach(function (trigger) {
      if (validTriggers[trigger]) {
        selectedTriggers[trigger] = true;
      }
    }); // Parse modifiers for triggers

    keys(validTriggers).forEach(function (trigger) {
      if (bindings.modifiers[trigger]) {
        selectedTriggers[trigger] = true;
      }
    }); // Sanitize triggers

    config.trigger = keys(selectedTriggers).join(' ');

    if (config.trigger === 'blur') {
      // Blur by itself is useless, so convert it to focus
      config.trigger = 'focus';
    }

    if (!config.trigger) {
      // Remove trigger config
      delete config.trigger;
    }

    return config;
  }; // Add or update PopOver on our element


  var applyPopover = function applyPopover(el, bindings, vnode) {
    if (!isBrowser) {
      /* istanbul ignore next */
      return;
    } // Popper is required for PopOvers to work


    if (!Popper) {
      /* istanbul ignore next */
      warn('v-b-popover: Popper.js is required for PopOvers to work');
      /* istanbul ignore next */

      return;
    }

    var config = parseBindings(bindings);

    if (el[BV_POPOVER]) {
      el[BV_POPOVER].updateConfig(config);
    } else {
      el[BV_POPOVER] = new PopOver(el, config, vnode.context.$root);
    }
  }; // Remove PopOver on our element


  var removePopover = function removePopover(el) {
    if (el[BV_POPOVER]) {
      el[BV_POPOVER].destroy();
      el[BV_POPOVER] = null;
      delete el[BV_POPOVER];
    }
  };
  /*
   * Export our directive
   */


  var BPopoverDirective = {
    bind: function bind(el, bindings, vnode) {
      applyPopover(el, bindings, vnode);
    },
    inserted: function inserted(el, bindings, vnode) {
      applyPopover(el, bindings, vnode);
    },
    update: function update(el, bindings, vnode)
    /* istanbul ignore next: not easy to test */
    {
      if (bindings.value !== bindings.oldValue) {
        applyPopover(el, bindings, vnode);
      }
    },
    componentUpdated: function componentUpdated(el, bindings, vnode)
    /* istanbul ignore next: not easy to test */
    {
      if (bindings.value !== bindings.oldValue) {
        applyPopover(el, bindings, vnode);
      }
    },
    unbind: function unbind(el) {
      removePopover(el);
    }
  };

  var components$v = {
    BPopover: BPopover
  };
  var directives$2 = {
    BPopover: BPopoverDirective
  };
  var index$s = {
    install: installFactory({
      components: components$v,
      directives: directives$2
    })
  };

  var BProgressBar = Vue.extend({
    name: 'BProgressBar',
    inject: {
      bvProgress: {
        default: function _default()
        /* istanbul ignore next */
        {
          return {};
        }
      }
    },
    props: {
      value: {
        type: Number,
        default: 0
      },
      label: {
        type: String,
        default: null
      },
      labelHtml: {
        type: String
      },
      // $parent (this.bvProgress) prop values may take precedence over the following props
      // Which is why they are defaulted to null
      max: {
        type: Number,
        default: null
      },
      precision: {
        type: Number,
        default: null
      },
      variant: {
        type: String,
        default: null
      },
      striped: {
        type: Boolean,
        default: null
      },
      animated: {
        type: Boolean,
        default: null
      },
      showProgress: {
        type: Boolean,
        default: null
      },
      showValue: {
        type: Boolean,
        default: null
      }
    },
    computed: {
      progressBarClasses: function progressBarClasses() {
        return [this.computedVariant ? "bg-".concat(this.computedVariant) : '', this.computedStriped || this.computedAnimated ? 'progress-bar-striped' : '', this.computedAnimated ? 'progress-bar-animated' : ''];
      },
      progressBarStyles: function progressBarStyles() {
        return {
          width: 100 * (this.value / this.computedMax) + '%'
        };
      },
      computedProgress: function computedProgress() {
        var p = Math.pow(10, this.computedPrecision);
        return Math.round(100 * p * this.value / this.computedMax) / p;
      },
      computedMax: function computedMax() {
        // Prefer our max over parent setting
        return isNumber(this.max) ? this.max : this.bvProgress.max || 100;
      },
      computedVariant: function computedVariant() {
        // Prefer our variant over parent setting
        return this.variant || this.bvProgress.variant;
      },
      computedPrecision: function computedPrecision() {
        // Prefer our precision over parent setting
        return isNumber(this.precision) ? this.precision : this.bvProgress.precision || 0;
      },
      computedStriped: function computedStriped() {
        // Prefer our striped over parent setting
        return isBoolean(this.striped) ? this.striped : this.bvProgress.striped || false;
      },
      computedAnimated: function computedAnimated() {
        // Prefer our animated over parent setting
        return isBoolean(this.animated) ? this.animated : this.bvProgress.animated || false;
      },
      computedShowProgress: function computedShowProgress() {
        // Prefer our showProgress over parent setting
        return isBoolean(this.showProgress) ? this.showProgress : this.bvProgress.showProgress || false;
      },
      computedShowValue: function computedShowValue() {
        // Prefer our showValue over parent setting
        return isBoolean(this.showValue) ? this.showValue : this.bvProgress.showValue || false;
      }
    },
    render: function render(h) {
      var childNodes = h(false);

      if (this.$slots.default) {
        childNodes = this.$slots.default;
      } else if (this.label || this.labelHtml) {
        childNodes = h('span', {
          domProps: htmlOrText(this.labelHtml, this.label)
        });
      } else if (this.computedShowProgress) {
        childNodes = this.computedProgress.toFixed(this.computedPrecision);
      } else if (this.computedShowValue) {
        childNodes = this.value.toFixed(this.computedPrecision);
      }

      return h('div', {
        staticClass: 'progress-bar',
        class: this.progressBarClasses,
        style: this.progressBarStyles,
        attrs: {
          role: 'progressbar',
          'aria-valuemin': '0',
          'aria-valuemax': this.computedMax.toString(),
          'aria-valuenow': this.value.toFixed(this.computedPrecision)
        }
      }, [childNodes]);
    }
  });

  var BProgress = Vue.extend({
    name: 'BProgress',
    provide: function provide() {
      return {
        bvProgress: this
      };
    },
    props: {
      // These props can be inherited via the child b-progress-bar(s)
      variant: {
        type: String,
        default: null
      },
      striped: {
        type: Boolean,
        default: false
      },
      animated: {
        type: Boolean,
        default: false
      },
      height: {
        type: String,
        default: null
      },
      precision: {
        type: Number,
        default: 0
      },
      showProgress: {
        type: Boolean,
        default: false
      },
      showValue: {
        type: Boolean,
        default: false
      },
      max: {
        type: Number,
        default: 100
      },
      // This prop is not inherited by child b-progress-bar(s)
      value: {
        type: Number,
        default: 0
      }
    },
    computed: {
      progressHeight: function progressHeight() {
        return {
          height: this.height || null
        };
      }
    },
    render: function render(h) {
      var childNodes = this.$slots.default;

      if (!childNodes) {
        childNodes = h(BProgressBar, {
          props: {
            value: this.value,
            max: this.max,
            precision: this.precision,
            variant: this.variant,
            animated: this.animated,
            striped: this.striped,
            showProgress: this.showProgress,
            showValue: this.showValue
          }
        });
      }

      return h('div', {
        class: ['progress'],
        style: this.progressHeight
      }, [childNodes]);
    }
  });

  var components$w = {
    BProgress: BProgress,
    BProgressBar: BProgressBar
  };
  var index$t = {
    install: installFactory({
      components: components$w
    })
  };

  var BSpinner = Vue.extend({
    name: 'BSpinner',
    functional: true,
    props: {
      type: {
        type: String,
        default: 'border' // SCSS currently supports 'border' or 'grow'

      },
      label: {
        type: String,
        default: null
      },
      variant: {
        type: String,
        default: null
      },
      small: {
        type: Boolean,
        default: false
      },
      role: {
        type: String,
        default: 'status'
      },
      tag: {
        type: String,
        default: 'span'
      }
    },
    render: function render(h, _ref) {
      var _class;

      var props = _ref.props,
          data = _ref.data,
          slots = _ref.slots;
      var label = h(false);
      var hasLabel = slots().label || props.label;

      if (hasLabel) {
        label = h('span', {
          staticClass: 'sr-only'
        }, hasLabel);
      }

      return h(props.tag, mergeData(data, {
        attrs: {
          role: hasLabel ? props.role || 'status' : null,
          'aria-hidden': hasLabel ? null : 'true'
        },
        class: (_class = {}, _defineProperty(_class, "spinner-".concat(props.type), Boolean(props.type)), _defineProperty(_class, "spinner-".concat(props.type, "-sm"), props.small), _defineProperty(_class, "text-".concat(props.variant), Boolean(props.variant)), _class)
      }), [label]);
    }
  });

  var components$x = {
    BSpinner: BSpinner
  };
  var index$u = {
    install: installFactory({
      components: components$x
    })
  };

  /**
   * Converts a string, including strings in camelCase or snake_case, into Start Case (a variant
   * of Title Case where all words start with a capital letter), it keeps original single quote
   * and hyphen in the word.
   *
   * Copyright (c) 2017 Compass (MIT)
   * https://github.com/UrbanCompass/to-start-case
   * @author Zhuoyuan Zhang <https://github.com/drawyan>
   * @author Wei Wang <https://github.com/onlywei>
   *
   *
   *   'management_companies' to 'Management Companies'
   *   'managementCompanies' to 'Management Companies'
   *   `hell's kitchen` to `Hell's Kitchen`
   *   `co-op` to `Co-op`
   *
   * @param {String} str
   * @returns {String}
   */
  var startCase = function startCase(str) {
    return str.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, function (str, $1, $2) {
      return $1 + ' ' + $2;
    }).replace(/(\s|^)(\w)/g, function (str, $1, $2) {
      return $1 + $2.toUpperCase();
    });
  };

  // Constants used by table helpers
  // Object of item keys that should be ignored for headers and stringification and filter events
  var IGNORED_FIELD_KEYS = {
    _rowVariant: true,
    _cellVariants: true,
    _showDetails: true // Filter CSS Selector for click/dblclick/etc events
    // If any of these selectors match the clicked element, we ignore the event

  };
  var EVENT_FILTER = ['a', 'a *', // include content inside links
  'button', 'button *', // include content inside buttons
  'input:not(.disabled):not([disabled])', 'select:not(.disabled):not([disabled])', 'textarea:not(.disabled):not([disabled])', '[role="link"]', '[role="link"] *', '[role="button"]', '[role="button"] *', '[tabindex]:not(.disabled):not([disabled])'].join(',');

  var processField = function processField(key, value) {
    var field = null;

    if (isString(value)) {
      // Label shortcut
      field = {
        key: key,
        label: value
      };
    } else if (isFunction(value)) {
      // Formatter shortcut
      field = {
        key: key,
        formatter: value
      };
    } else if (isObject(value)) {
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

    if (isArray$1(origFields)) {
      // Normalize array Form
      origFields.filter(function (f) {
        return f;
      }).forEach(function (f) {
        if (isString(f)) {
          fields.push({
            key: f,
            label: startCase(f)
          });
        } else if (isObject(f) && f.key && isString(f.key)) {
          // Full object definition. We use assign so that we don't mutate the original
          fields.push(_objectSpread({}, f));
        } else if (isObject(f) && keys(f).length === 1) {
          // Shortcut object (i.e. { 'foo_bar': 'This is Foo Bar' }
          var key = keys(f)[0];
          var field = processField(key, f[key]);

          if (field) {
            fields.push(field);
          }
        }
      });
    } else if (origFields && isObject(origFields) && keys(origFields).length > 0) {
      // Normalize object Form (deprecated)
      keys(origFields).forEach(function (key) {
        var field = processField(key, origFields[key]);

        if (field) {
          fields.push(field);
        }
      });
    } // If no field provided, take a sample from first record (if exits)


    if (fields.length === 0 && isArray$1(items) && items.length > 0) {
      var sample = items[0];
      keys(sample).forEach(function (k) {
        if (!IGNORED_FIELD_KEYS[k]) {
          fields.push({
            key: k,
            label: startCase(k)
          });
        }
      });
    } // Ensure we have a unique array of fields and that they have String labels


    var memo = {};
    return fields.filter(function (f) {
      if (!memo[f.key]) {
        memo[f.key] = true;
        f.label = isString(f.label) ? f.label : startCase(f.key);
        return true;
      }

      return false;
    });
  };

  var itemsMixin = {
    props: {
      items: {
        type: [Array, Function],
        default: function _default()
        /* istanbul ignore next */
        {
          return [];
        }
      },
      fields: {
        // Object format is deprecated and should be avoided
        type: [Array, Object],
        default: null
      },
      primaryKey: {
        // Primary key for record.
        // If provided the value in each row must be unique!!!
        type: String,
        default: null
      }
    },
    data: function data() {
      return {
        // Our local copy of the items. Must be an array
        localItems: isArray$1(this.items) ? this.items.slice() : []
      };
    },
    computed: {
      computedFields: function computedFields() {
        // We normalize fields into an array of objects
        // [ { key:..., label:..., ...}, {...}, ..., {..}]
        return normalizeFields(this.fields, this.localItems);
      },
      computedFieldsObj: function computedFieldsObj()
      /* istanbul ignore next: not using at the moment */
      {
        // Fields as a simple lookup hash object
        // Mainly for scopedSlots for convenience
        return this.computedFields.reduce(function (f, obj) {
          obj[f.key] = f;
          return obj;
        }, {});
      }
    },
    watch: {
      items: function items(newItems) {
        /* istanbul ignore else */
        if (isArray$1(newItems)) {
          // Set localItems/filteredItems to a copy of the provided array
          this.localItems = newItems.slice();
        } else if (isUndefined(newItems) || isNull(newItems)) {
          /* istanbul ignore next */
          this.localItems = [];
        }
      }
    }
  };

  // TODO: add option to specify which fields to include

  function sanitizeRow(row) {
    return keys(row).reduce(function (obj, key) {
      // Ignore special fields that start with _
      if (!IGNORED_FIELD_KEYS[key]) {
        obj[key] = row[key];
      }

      return obj;
    }, {});
  }

  // SSR safe deterministic way (keys are sorted before stringification)
  //
  //   ex:
  //     { b: 3, c: { z: 'zzz', d: null, e: 2 }, d: [10, 12, 11], a: 'one' }
  //   becomes
  //     'one 3 2 zzz 10 12 11'
  //
  // Primitives (numbers/strings) are returned as-is
  // Null and undefined values are filtered out
  // Dates are converted to their native string format
  //

  function stringifyObjectValues(val) {
    if (isUndefined(val) || isNull(val)) {
      /* istanbul ignore next */
      return '';
    }

    if (val instanceof Object && !(val instanceof Date)) {
      // Arrays are also object, and keys just returns the array indexes
      // Date objects we convert to strings
      return keys(val).sort()
      /* sort to prevent SSR issues on pre-rendered sorted tables */
      .filter(function (v) {
        return !isUndefined(v) && !isNull(v);
      })
      /* ignore undefined/null values */
      .map(function (k) {
        return stringifyObjectValues(val[k]);
      }).join(' ');
    }

    return String(val);
  }

  // TODO: add option to strigify formatted/scopedSlot items, and only specific fields

  function stringifyRecordValues(row) {
    /* istanbul ignore else */
    if (row instanceof Object) {
      return stringifyObjectValues(sanitizeRow(row));
    } else {
      /* istanbul ignore next */
      return '';
    }
  }

  var DEPRECATION_MSG = 'Supplying a function to prop "filter" is deprecated. Use "filter-function" instead.';
  var filteringMixin = {
    props: {
      filter: {
        // Passing a function to filter is deprecated and should be avoided
        type: [String, RegExp, Object, Array, Function],
        default: null,
        // `deprecated` -> Don't use this prop
        // `deprecation` -> Refers to a change in prop usage
        deprecation: DEPRECATION_MSG
      },
      filterFunction: {
        type: Function,
        default: null
      }
    },
    data: function data() {
      return {
        // Flag for displaying which empty slot to show, and for some event triggering.
        isFiltered: false
      };
    },
    computed: {
      localFiltering: function localFiltering() {
        return this.hasProvider ? !!this.noProviderFiltering : true;
      },
      filteredCheck: function filteredCheck() {
        // For watching changes to filteredItems vs localItems
        return {
          filteredItems: this.filteredItems,
          localItems: this.localItems,
          localFilter: this.localFilter
        };
      },
      localFilter: function localFilter() {
        // Returns a sanitized/normalized version of filter prop
        if (isFunction(this.filter)) {
          // this.localFilterFn will contain the correct function ref.
          // Deprecate setting prop filter to a function

          /* istanbul ignore next */
          return '';
        } else if (!isFunction(this.filterFunction) && !(isString(this.filter) || isRegExp(this.filter))) {
          // Using internal filter function, which only accepts string or regexp at the moment
          return '';
        } else {
          // Could be a string, object or array, as needed by external filter function
          return this.filter;
        }
      },
      localFilterFn: function localFilterFn() {
        var filter = this.filter;
        var filterFn = this.filterFunction; // Sanitized/normalize filter-function prop

        if (isFunction(filterFn)) {
          return filterFn;
        } else if (isFunction(filter)) {
          // Deprecate setting prop filter to a function

          /* istanbul ignore next */
          warn("b-table: ".concat(DEPRECATION_MSG));
          /* istanbul ignore next */

          return filter;
        } else {
          // no filterFunction, so signal to use internal filter function
          return null;
        }
      },
      filteredItems: function filteredItems() {
        // Returns the records in localItems that match the filter criteria.
        // Returns the original localItems array if not sorting
        var items = this.localItems || [];
        var criteria = this.localFilter;
        var filterFn = this.filterFnFactory(this.localFilterFn, criteria) || this.defaultFilterFnFactory(criteria); // We only do local filtering if requested, and if the are records to filter and
        // if a filter criteria was specified

        if (this.localFiltering && filterFn && items.length > 0) {
          items = items.filter(filterFn);
        }

        return items;
      }
    },
    watch: {
      // Watch for changes to the filter criteria and filtered items vs localItems).
      // And set visual state and emit events as required
      filteredCheck: function filteredCheck(_ref) {
        var filteredItems = _ref.filteredItems,
            localItems = _ref.localItems,
            localFilter = _ref.localFilter;
        // Determine if the dataset is filtered or not
        var isFiltered;

        if (!localFilter) {
          // If filter criteria is falsey
          isFiltered = false;
        } else if (looseEqual(localFilter, []) || looseEqual(localFilter, {})) {
          // If filter criteria is an empty array or object
          isFiltered = false;
        } else if (localFilter) {
          // if Filter criteria is truthy
          isFiltered = true;
        } else {
          /* istanbul ignore next: rare chance of reaching this else */
          isFiltered = false;
        }

        if (isFiltered) {
          this.$emit('filtered', filteredItems, filteredItems.length);
        }

        this.isFiltered = isFiltered;
      },
      isFiltered: function isFiltered(newVal, oldVal) {
        if (newVal === false && oldVal === true) {
          // We need to emit a filtered event if isFiltered transitions from true to
          // false so that users can update their pagination controls.
          this.$emit('filtered', this.localItems, this.localItems.length);
        }
      }
    },
    created: function created() {
      var _this = this;

      // Set the initial filtered state.
      // In a nextTick so that we trigger a filtered event if needed
      this.$nextTick(function () {
        _this.isFiltered = Boolean(_this.localFilter);
      });
    },
    methods: {
      // Filter Function factories
      filterFnFactory: function filterFnFactory(filterFn, criteria) {
        // Wrapper factory for external filter functions.
        // Wrap the provided filter-function and return a new function.
        // Returns null if no filter-function defined or if criteria is falsey.
        // Rather than directly grabbing this.computedLocalFilterFn or this.filterFunction
        // we have it passed, so that the caller computed prop will be reactive to changes
        // in the original filter-function (as this routine is a method)
        if (!filterFn || !isFunction(filterFn) || !criteria || looseEqual(criteria, []) || looseEqual(criteria, {})) {
          return null;
        } // Build the wrapped filter test function, passing the criteria to the provided function


        var fn = function fn(item) {
          // Generated function returns true if the criteria matches part
          // of the serialized data, otherwise false
          return filterFn(item, criteria);
        }; // Return the wrapped function


        return fn;
      },
      defaultFilterFnFactory: function defaultFilterFnFactory(criteria) {
        // Generates the default filter function, using the given filter criteria
        if (!criteria || !(isString(criteria) || isRegExp(criteria))) {
          // Built in filter can only support strings or RegExp criteria (at the moment)
          return null;
        } // Build the regexp needed for filtering


        var regexp = criteria;

        if (isString(regexp)) {
          // Escape special RegExp characters in the string and convert contiguous
          // whitespace to \s+ matches
          var pattern = criteria.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/[\s\uFEFF\xA0]+/g, '\\s+'); // Build the RegExp (no need for global flag, as we only need
          // to find the value once in the string)

          regexp = new RegExp(".*".concat(pattern, ".*"), 'i');
        } // Generate the wrapped filter test function to use


        var fn = function fn(item) {
          // This searches all row values (and sub property values) in the entire (excluding
          // special _ prefixed keys), because we convert the record to a space-separated
          // string containing all the value properties (recursively), even ones that are
          // not visible (not specified in this.fields).
          //
          // TODO: Enable searching on formatted fields and scoped slots
          // TODO: Should we filter only on visible fields (i.e. ones in this.fields) by default?
          // TODO: Allow for searching on specific fields/key, this could be combined with the previous TODO
          // TODO: Give stringifyRecordValues extra options for filtering (i.e. passing the
          //       fields definition and a reference to $scopedSlots)
          //
          // Generated function returns true if the criteria matches part of
          // the serialized data, otherwise false
          // We set lastIndex = 0 on regex in case someone uses the /g global flag
          regexp.lastIndex = 0;
          return regexp.test(stringifyRecordValues(item));
        }; // Return the generated function


        return fn;
      }
    }
  };

  /*
   * Consistent and stable sort function across JavaScript platforms
   *
   * Inconsistent sorts can cause SSR problems between client and server
   * such as in <b-table> if sortBy is applied to the data on server side render.
   * Chrome and V8 native sorts are inconsistent/unstable
   *
   * This function uses native sort with fallback to index compare when the a and b
   * compare returns 0
   *
   * Algorithm based on:
   * https://stackoverflow.com/questions/1427608/fast-stable-sorting-algorithm-implementation-in-javascript/45422645#45422645
   *
   * @param {array} array to sort
   * @param {function} sort compare function
   * @return {array}
   */
  var stableSort = function stableSort(array, compareFn) {
    // Using `.bind(compareFn)` on the wrapped anonymous function improves
    // performance by avoiding the function call setup. We don't use an arrow
    // function here as it binds `this` to the `stableSort` context rather than
    // the `compareFn` context, which wouldn't give us the performance increase.
    return array.map(function (a, index) {
      return [index, a];
    }).sort(function (a, b) {
      return this(a[1], b[1]) || a[0] - b[0];
    }.bind(compareFn)).map(function (e) {
      return e[1];
    });
  };

  //
  // TODO: add option to sort by multiple columns (tri-state per column, plus order of columns in sort)
  //  where sortBy could be an array of objects [ {key: 'foo', sortDir: 'asc'}, {key:'bar', sortDir: 'desc'} ...]
  //  or an array of arrays [ ['foo','asc'], ['bar','desc'] ]

  function defaultSortCompare(a, b, sortBy) {
    a = get(a, sortBy, '');
    b = get(b, sortBy, '');

    if (isDate(a) && isDate(b) || isNumber(a) && isNumber(b)) {
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
      return stringifyObjectValues(a).localeCompare(stringifyObjectValues(b), undefined, {
        numeric: true
      });
    }
  }

  var sortingMixin = {
    props: {
      sortBy: {
        type: String,
        default: null
      },
      sortDesc: {
        // To Do: Make this tri-state: true, false, null
        type: Boolean,
        default: false
      },
      sortDirection: {
        // This prop is named incorrectly.
        // It should be initialSortDirection
        // As it is a bit misleading (not to mention screws up
        // the Aria Label on the headers)
        type: String,
        default: 'asc',
        validator: function validator(direction) {
          return arrayIncludes(['asc', 'desc', 'last'], direction);
        }
      },
      sortCompare: {
        type: Function,
        default: null
      },
      noSortReset: {
        // Another prop that should have had a better name.
        // It should be noSortClear (on non-sortable headers).
        // We will need to make sure the documentation is clear on what
        // this prop does (as well as in the code for future reference)
        type: Boolean,
        default: false
      },
      labelSortAsc: {
        type: String,
        default: 'Click to sort Ascending'
      },
      labelSortDesc: {
        type: String,
        default: 'Click to sort Descending'
      },
      labelSortClear: {
        type: String,
        default: 'Click to clear sorting'
      },
      noLocalSorting: {
        type: Boolean,
        default: false
      },
      noFooterSorting: {
        type: Boolean,
        default: false
      }
    },
    data: function data() {
      return {
        localSortBy: this.sortBy || '',
        localSortDesc: this.sortDesc || false
      };
    },
    computed: {
      localSorting: function localSorting() {
        return this.hasProvider ? !!this.noProviderSorting : !this.noLocalSorting;
      },
      isSortable: function isSortable() {
        return this.computedFields.some(function (f) {
          return f.sortable;
        });
      },
      sortedItems: function sortedItems() {
        // Sorts the filtered items and returns a new array of the sorted items
        // or the original items array if not sorted.
        var items = (this.filteredItems || []).slice();
        var sortBy = this.localSortBy;
        var sortDesc = this.localSortDesc;
        var sortCompare = this.sortCompare;
        var localSorting = this.localSorting;

        if (sortBy && localSorting) {
          // stableSort returns a new array, and leaves the original array intact
          return stableSort(items, function (a, b) {
            var result = null;

            if (isFunction(sortCompare)) {
              // Call user provided sortCompare routine
              result = sortCompare(a, b, sortBy, sortDesc);
            }

            if (isUndefined(result) || isNull(result) || result === false) {
              // Fallback to built-in defaultSortCompare if sortCompare
              // is not defined or returns null/false
              result = defaultSortCompare(a, b, sortBy);
            } // Negate result if sorting in descending order


            return (result || 0) * (sortDesc ? -1 : 1);
          });
        }

        return items;
      }
    },
    watch: {
      isSortable: function isSortable(newVal, oldVal)
      /* istanbul ignore next: pain in the butt to test */
      {
        if (newVal) {
          if (this.isSortable) {
            this.$on('head-clicked', this.handleSort);
          }
        } else {
          this.$off('head-clicked', this.handleSort);
        }
      },
      sortDesc: function sortDesc(newVal, oldVal) {
        if (newVal === this.localSortDesc) {
          /* istanbul ignore next */
          return;
        }

        this.localSortDesc = newVal || false;
      },
      sortBy: function sortBy(newVal, oldVal) {
        if (newVal === this.localSortBy) {
          /* istanbul ignore next */
          return;
        }

        this.localSortBy = newVal || null;
      },
      // Update .sync props
      localSortDesc: function localSortDesc(newVal, oldVal) {
        // Emit update to sort-desc.sync
        if (newVal !== oldVal) {
          this.$emit('update:sortDesc', newVal);
        }
      },
      localSortBy: function localSortBy(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.$emit('update:sortBy', newVal);
        }
      }
    },
    created: function created() {
      if (this.isSortable) {
        this.$on('head-clicked', this.handleSort);
      }
    },
    methods: {
      // Handlers
      // Need to move from thead-mixin
      handleSort: function handleSort(key, field, evt, isFoot) {
        var _this = this;

        if (!this.isSortable) {
          /* istanbul ignore next */
          return;
        }

        if (isFoot && this.noFooterSorting) {
          return;
        } // TODO: make this tri-state sorting
        // cycle desc => asc => none => desc => ...


        var sortChanged = false;

        var toggleLocalSortDesc = function toggleLocalSortDesc() {
          var sortDirection = field.sortDirection || _this.sortDirection;

          if (sortDirection === 'asc') {
            _this.localSortDesc = false;
          } else if (sortDirection === 'desc') {
            _this.localSortDesc = true;
          }
        };

        if (field.sortable) {
          if (key === this.localSortBy) {
            // Change sorting direction on current column
            this.localSortDesc = !this.localSortDesc;
          } else {
            // Start sorting this column ascending
            this.localSortBy = key; // this.localSortDesc = false

            toggleLocalSortDesc();
          }

          sortChanged = true;
        } else if (this.localSortBy && !this.noSortReset) {
          this.localSortBy = null;
          toggleLocalSortDesc();
          sortChanged = true;
        }

        if (sortChanged) {
          // Sorting parameters changed
          this.$emit('sort-changed', this.context);
        }
      },
      // methods to compute classes and attrs for thead>th cells
      sortTheadThClasses: function sortTheadThClasses(key, field, isFoot) {
        return {// No Classes for sorting currently...
          // All styles targeted using aria-* attrs
        };
      },
      sortTheadThAttrs: function sortTheadThAttrs(key, field, isFoot) {
        if (!this.isSortable || isFoot && this.noFooterSorting) {
          // No attributes if not a sortable table
          return {};
        }

        var sortable = field.sortable;
        var ariaLabel = '';

        if ((!field.label || !field.label.trim()) && !field.headerTitle) {
          // In case field's label and title are empty/blank, we need to
          // add a hint about what the column is about for non-sighted users.
          // This is duplicated code from tbody-row mixin, but we need it
          // here as well, since we overwrite the original aria-label.

          /* istanbul ignore next */
          ariaLabel = startCase(key);
        } // The correctness of these labels is very important for screen-reader users.


        var ariaLabelSorting = '';

        if (sortable) {
          if (this.localSortBy === key) {
            // currently sorted sortable column.
            ariaLabelSorting = this.localSortDesc ? this.labelSortAsc : this.labelSortDesc;
          } else {
            // Not currently sorted sortable column.
            // Not using nested ternary's here for clarity/readability
            // Default for ariaLabel
            ariaLabelSorting = this.localSortDesc ? this.labelSortDesc : this.labelSortAsc; // Handle sortDirection setting

            var sortDirection = this.sortDirection || field.sortDirection;

            if (sortDirection === 'asc') {
              ariaLabelSorting = this.labelSortAsc;
            } else if (sortDirection === 'desc') {
              ariaLabelSorting = this.labelSortDesc;
            }
          }
        } else if (!this.noSortReset) {
          // Non sortable column
          ariaLabelSorting = this.localSortBy ? this.labelSortClear : '';
        } // Assemble the aria-label attribute value


        ariaLabel = [ariaLabel.trim(), ariaLabelSorting.trim()].filter(Boolean).join(': '); // Assemble the aria-sort attribute value

        var ariaSort = sortable && this.localSortBy === key ? this.localSortDesc ? 'descending' : 'ascending' : sortable ? 'none' : null; // Return the attributes
        // (All the above just to get these two values)

        return {
          'aria-label': ariaLabel || null,
          'aria-sort': ariaSort
        };
      }
    }
  };

  var paginationMixin$1 = {
    props: {
      perPage: {
        type: [Number, String],
        default: 0
      },
      currentPage: {
        type: [Number, String],
        default: 1
      }
    },
    computed: {
      localPaging: function localPaging() {
        return this.hasProvider ? !!this.noProviderPaging : true;
      },
      paginatedItems: function paginatedItems() {
        var items = this.sortedItems || [];
        var currentPage = Math.max(parseInt(this.currentPage, 10) || 1, 1);
        var perPage = Math.max(parseInt(this.perPage, 10) || 0, 0); // Apply local pagination

        if (this.localPaging && !!perPage) {
          // Grab the current page of data (which may be past filtered items limit)
          items = items.slice((currentPage - 1) * perPage, currentPage * perPage);
        } // Return the items to display in the table


        return items;
      }
    }
  };

  var captionMixin = {
    props: {
      caption: {
        type: String,
        default: null
      },
      captionHtml: {
        type: String
      },
      captionTop: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      captionClasses: function captionClasses() {
        return {
          'b-table-caption-top': this.captionTop
        };
      },
      captionId: function captionId() {
        // Even though this.safeId looks like a method, it is a computed prop
        // that returns a new function if the underlying ID changes
        return this.isStacked ? this.safeId('_caption_') : null;
      }
    },
    methods: {
      renderCaption: function renderCaption() {
        var h = this.$createElement; // Build the caption

        var $captionSlot = this.normalizeSlot('table-caption', {});
        var $caption = h(false);

        if ($captionSlot || this.caption || this.captionHtml) {
          var data = {
            key: 'caption',
            class: this.captionClasses,
            attrs: {
              id: this.captionId
            }
          };

          if (!$captionSlot) {
            data.domProps = htmlOrText(this.captionHtml, this.caption);
          }

          $caption = h('caption', data, [$captionSlot]);
        }

        return $caption;
      }
    }
  };

  var colgroupMixin = {
    methods: {
      renderColgroup: function renderColgroup() {
        var h = this.$createElement;
        var fields = this.computedFields;
        var $colgroup = h(false);

        if (this.hasNormalizedSlot('table-colgroup')) {
          $colgroup = h('colgroup', {
            key: 'colgroup'
          }, [this.normalizeSlot('table-colgroup', {
            columns: fields.length,
            fields: fields
          })]);
        }

        return $colgroup;
      }
    }
  };

  // Avoids having the user need to use @click.stop on the form control

  function filterEvent(evt) {
    if (!evt || !evt.target) {
      /* istanbul ignore next */
      return;
    }

    var el = evt.target;

    if (el.tagName === 'TD' || el.tagName === 'TH' || el.tagName === 'TR' || el.disabled) {
      // Shortut all the following tests for efficiency
      return false;
    }

    if (closest('.dropdown-menu', el)) {
      // Click was in a dropdown menu, so ignore
      return true;
    }

    var label = el.tagName === 'LABEL' ? el : closest('label', el);

    if (label && label.control && !label.control.disabled) {
      // If the label's form control is not disabled then we don't propagate evt
      return true;
    } // Else check to see if the event target matches one of the selectors in the event filter
    // i.e. anchors, non disabled inputs, etc. Return true if we should ignore the event.


    return matches(el, EVENT_FILTER);
  }

  // Helper to determine if a there is an active text selection on the document page.
  function textSelectionActive() {
    var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
    var win = window;
    /* istanbul ignore if: JSDOM doesn't support getSelection */

    if (win && win.getSelection && win.getSelection().toString() !== '' && isElement(el)) {
      /* istanbul ignore next: JSDOM doesn't support getSelection */
      var sel = win.getSelection();
      /* istanbul ignore next: JSDOM doesn't support getSelection */

      return sel.containsNode ? sel.containsNode(el, true) : false;
    } else {
      return false;
    }
  }

  var theadMixin = {
    props: {
      headVariant: {
        type: String,
        default: ''
      },
      theadClass: {
        type: [String, Array, Object],
        default: null
      },
      theadTrClass: {
        type: [String, Array, Object],
        default: null
      }
    },
    computed: {
      headClasses: function headClasses() {
        return [this.headVariant ? 'thead-' + this.headVariant : '', this.theadClass];
      }
    },
    methods: {
      fieldClasses: function fieldClasses(field) {
        // header field (th) classes
        return [field.variant ? 'table-' + field.variant : '', field.class ? field.class : '', field.thClass ? field.thClass : ''];
      },
      headClicked: function headClicked(evt, field, isFoot) {
        if (this.stopIfBusy(evt)) {
          // If table is busy (via provider) then don't propagate
          return;
        } else if (filterEvent(evt)) {
          // clicked on a non-disabled control so ignore
          return;
        } else if (textSelectionActive(this.$el)) {
          // User is selecting text, so ignore

          /* istanbul ignore next: JSDOM doesn't support getSelection() */
          return;
        }

        evt.stopPropagation();
        evt.preventDefault();
        this.$emit('head-clicked', field.key, field, evt, isFoot);
      },
      renderThead: function renderThead() {
        var _this = this;

        var isFoot = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var h = this.$createElement;

        if (this.isStacked === true) {
          // In always stacked mode, we don't bother rendering the head/foot
          return h(false);
        }

        var fields = this.computedFields || []; // Helper function to generate a field TH cell

        var makeCell = function makeCell(field, colIndex) {
          var ariaLabel = null;

          if (!field.label.trim() && !field.headerTitle) {
            // In case field's label and title are empty/blank
            // We need to add a hint about what the column is about for non-sighted users

            /* istanbul ignore next */
            ariaLabel = startCase(field.key);
          }

          var hasHeadClickListener = _this.$listeners['head-clicked'] || _this.isSortable;
          var handlers = {};

          if (hasHeadClickListener) {
            handlers.click = function (evt) {
              _this.headClicked(evt, field, isFoot);
            };

            handlers.keydown = function (evt) {
              var keyCode = evt.keyCode;

              if (keyCode === KEY_CODES.ENTER || keyCode === KEY_CODES.SPACE) {
                _this.headClicked(evt, field, isFoot);
              }
            };
          }

          var data = {
            key: field.key,
            class: [_this.fieldClasses(field), _this.sortTheadThClasses(field.key, field, isFoot)],
            style: field.thStyle || {},
            attrs: _objectSpread({
              // We only add a tabindex of 0 if there is a head-clicked listener
              tabindex: hasHeadClickListener ? '0' : null,
              abbr: field.headerAbbr || null,
              title: field.headerTitle || null,
              role: 'columnheader',
              scope: 'col',
              'aria-colindex': String(colIndex + 1),
              'aria-label': ariaLabel
            }, _this.sortTheadThAttrs(field.key, field, isFoot)),
            on: handlers
          };
          var fieldScope = {
            label: field.label,
            column: field.key,
            field: field
          };
          var slot = isFoot && _this.hasNormalizedSlot("FOOT_".concat(field.key)) ? _this.normalizeSlot("FOOT_".concat(field.key), fieldScope) : _this.normalizeSlot("HEAD_".concat(field.key), fieldScope);

          if (slot) {
            slot = [slot];
          } else {
            data.domProps = htmlOrText(field.labelHtml);
          }

          return h('th', data, slot || field.label);
        }; // Generate the array of TH cells


        var $cells = fields.map(makeCell).filter(function (th) {
          return th;
        }); // Genrate the row(s)

        var $trs = [];

        if (isFoot) {
          $trs.push(h('tr', {
            class: this.tfootTrClass,
            attrs: {
              role: 'row'
            }
          }, $cells));
        } else {
          var scope = {
            columns: fields.length,
            fields: fields
          };
          $trs.push(this.normalizeSlot('thead-top', scope) || h(false));
          $trs.push(h('tr', {
            class: this.theadTrClass,
            attrs: {
              role: 'row'
            }
          }, $cells));
        }

        return h(isFoot ? 'tfoot' : 'thead', {
          key: isFoot ? 'tfoot' : 'thead',
          class: isFoot ? this.footClasses : this.headClasses,
          attrs: {
            role: 'rowgroup'
          }
        }, $trs);
      }
    }
  };

  var tfootMixin = {
    props: {
      footClone: {
        type: Boolean,
        default: false
      },
      footVariant: {
        type: String,
        default: ''
      },
      tfootClass: {
        type: [String, Array, Object],
        default: null
      },
      tfootTrClass: {
        type: [String, Array, Object],
        default: null
      }
    },
    computed: {
      footClasses: function footClasses() {
        var variant = this.footVariant || this.headVariant || null;
        return [variant ? 'thead-' + variant : '', this.tfootClass];
      }
    },
    methods: {
      renderTfoot: function renderTfoot() {
        var h = this.$createElement; // Passing true to renderThead will make it render a tfoot

        return this.footClone ? this.renderThead(true) : h(false);
      }
    }
  };

  var tbodyRowMixin = {
    props: {
      tbodyTrClass: {
        type: [String, Array, Function],
        default: null
      }
    },
    methods: {
      // Methods for computing classes, attributes and styles for table cells
      tdClasses: function tdClasses(field, item) {
        var cellVariant = '';

        if (item._cellVariants && item._cellVariants[field.key]) {
          cellVariant = "".concat(this.dark ? 'bg' : 'table', "-").concat(item._cellVariants[field.key]);
        }

        return [field.variant && !cellVariant ? "".concat(this.dark ? 'bg' : 'table', "-").concat(field.variant) : '', cellVariant, field.class ? field.class : '', this.getTdValues(item, field.key, field.tdClass, '')];
      },
      tdAttrs: function tdAttrs(field, item, colIndex) {
        var attrs = {
          role: 'cell',
          'aria-colindex': String(colIndex + 1)
        };

        if (field.isRowHeader) {
          attrs.scope = 'row';
          attrs.role = 'rowheader';
        }

        if (this.isStacked) {
          // Generate the "header cell" label content in stacked mode
          attrs['data-label'] = field.label;
        }

        return _objectSpread({}, attrs, this.getTdValues(item, field.key, field.tdAttr, {}));
      },
      rowClasses: function rowClasses(item) {
        return [item._rowVariant ? "".concat(this.dark ? 'bg' : 'table', "-").concat(item._rowVariant) : '', isFunction(this.tbodyTrClass) ? this.tbodyTrClass(item, 'row') : this.tbodyTrClass];
      },
      getTdValues: function getTdValues(item, key, tdValue, defValue) {
        var parent = this.$parent;

        if (tdValue) {
          var value = get(item, key, '');

          if (isFunction(tdValue)) {
            return tdValue(value, key, item);
          } else if (isString(tdValue) && isFunction(parent[tdValue])) {
            return parent[tdValue](value, key, item);
          }

          return tdValue;
        }

        return defValue;
      },
      // Method to get the value for a field
      getFormattedValue: function getFormattedValue(item, field) {
        var key = field.key;
        var formatter = field.formatter;
        var parent = this.$parent;
        var value = get(item, key, null);

        if (formatter) {
          if (isFunction(formatter)) {
            value = formatter(value, key, item);
          } else if (isString(formatter) && isFunction(parent[formatter])) {
            value = parent[formatter](value, key, item);
          }
        }

        return isUndefined(value) || isNull(value) ? '' : value;
      },
      tbodyRowKeydown: function tbodyRowKeydown(evt, item, rowIndex) {
        var keyCode = evt.keyCode;
        var target = evt.target;
        var trs = this.$refs.itemRows;

        if (this.stopIfBusy(evt)) {
          // If table is busy (via provider) then don't propagate
          return;
        } else if (!(target && target.tagName === 'TR' && target === document.activeElement)) {
          // Ignore if not the active tr element
          return;
        } else if (target.tabIndex !== 0) {
          // Ignore if not focusable

          /* istanbul ignore next */
          return;
        } else if (trs && trs.length === 0) {
          /* istanbul ignore next */
          return;
        }

        var index = trs.indexOf(target);

        if (keyCode === KEY_CODES.ENTER || keyCode === KEY_CODES.SPACE) {
          evt.stopPropagation();
          evt.preventDefault(); // We also allow enter/space to trigger a click (when row is focused)
          // We translate to a row-clicked event

          this.rowClicked(evt, item, rowIndex);
        } else if (arrayIncludes([KEY_CODES.UP, KEY_CODES.DOWN, KEY_CODES.HOME, KEY_CODES.END], keyCode)) {
          evt.stopPropagation();
          evt.preventDefault();
          var shift = evt.shiftKey;

          if (keyCode === KEY_CODES.HOME || shift && keyCode === KEY_CODES.UP) {
            // Focus first row
            trs[0].focus();
          } else if (keyCode === KEY_CODES.END || shift && keyCode === KEY_CODES.DOWN) {
            // Focus last row
            trs[trs.length - 1].focus();
          } else if (keyCode === KEY_CODES.UP && index > 0) {
            // Focus previous row
            trs[index - 1].focus();
          } else if (keyCode === KEY_CODES.DOWN && index < trs.length - 1) {
            // Focus next row
            trs[index + 1].focus();
          }
        }
      },
      // Row event handlers
      rowClicked: function rowClicked(e, item, index) {
        if (this.stopIfBusy(e)) {
          // If table is busy (via provider) then don't propagate
          return;
        } else if (filterEvent(e)) {
          // clicked on a non-disabled control so ignore
          return;
        } else if (textSelectionActive(this.$el)) {
          // User is selecting text, so ignore

          /* istanbul ignore next: JSDOM doesn't support getSelection() */
          return;
        }

        this.$emit('row-clicked', item, index, e);
      },
      middleMouseRowClicked: function middleMouseRowClicked(e, item, index) {
        if (this.stopIfBusy(e)) {
          // If table is busy (via provider) then don't propagate
          return;
        }

        this.$emit('row-middle-clicked', item, index, e);
      },
      rowDblClicked: function rowDblClicked(e, item, index) {
        if (this.stopIfBusy(e)) {
          // If table is busy (via provider) then don't propagate
          return;
        } else if (filterEvent(e)) {
          // clicked on a non-disabled control so ignore

          /* istanbul ignore next: event filtering already tested via click handler */
          return;
        }

        this.$emit('row-dblclicked', item, index, e);
      },
      rowHovered: function rowHovered(e, item, index) {
        if (this.stopIfBusy(e)) {
          // If table is busy (via provider) then don't propagate
          return;
        }

        this.$emit('row-hovered', item, index, e);
      },
      rowUnhovered: function rowUnhovered(e, item, index) {
        if (this.stopIfBusy(e)) {
          // If table is busy (via provider) then don't propagate
          return;
        }

        this.$emit('row-unhovered', item, index, e);
      },
      rowContextmenu: function rowContextmenu(e, item, index) {
        if (this.stopIfBusy(e)) {
          // If table is busy (via provider) then don't propagate
          return;
        }

        this.$emit('row-contextmenu', item, index, e);
      },
      // Render helpers
      renderTbodyRowCell: function renderTbodyRowCell(field, colIndex, item, rowIndex) {
        var _this = this;

        var h = this.$createElement; // Renders a TD or TH for a row's field

        var $scoped = this.$scopedSlots;
        var detailsSlot = $scoped['row-details'];
        var rowSelected = this.selectedRows[rowIndex];
        var formatted = this.getFormattedValue(item, field);
        var data = {
          // For the Vue key, we concatenate the column index and
          // field key (as field keys can be duplicated)
          key: "row-".concat(rowIndex, "-cell-").concat(colIndex, "-").concat(field.key),
          class: this.tdClasses(field, item),
          attrs: this.tdAttrs(field, item, colIndex)
        };

        var toggleDetailsFn = function toggleDetailsFn() {
          if (detailsSlot) {
            _this.$set(item, '_showDetails', !item._showDetails);
          }
        };

        var slotScope = {
          item: item,
          index: rowIndex,
          field: field,
          unformatted: get(item, field.key, ''),
          value: formatted,
          toggleDetails: toggleDetailsFn,
          detailsShowing: Boolean(item._showDetails),
          rowSelected: Boolean(rowSelected)
        };
        var $childNodes = $scoped[field.key] ? $scoped[field.key](slotScope) : toString$1(formatted);

        if (this.isStacked) {
          // We wrap in a DIV to ensure rendered as a single cell when visually stacked!
          $childNodes = [h('div', {}, [$childNodes])];
        } // Render either a td or th cell


        return h(field.isRowHeader ? 'th' : 'td', data, [$childNodes]);
      },
      renderTbodyRow: function renderTbodyRow(item, rowIndex) {
        var _this2 = this;

        // Renders an item's row (or rows if details supported)
        var h = this.$createElement;
        var $scoped = this.$scopedSlots;
        var fields = this.computedFields;
        var tableStriped = this.striped;
        var hasRowClickHandler = this.$listeners['row-clicked'] || this.selectable;
        var $detailsSlot = $scoped['row-details'];
        var rowShowDetails = Boolean(item._showDetails && $detailsSlot); // We can return more than one TR if rowDetails enabled

        var $rows = []; // Details ID needed for aria-describedby when details showing

        var detailsId = rowShowDetails ? this.safeId("_details_".concat(rowIndex, "_")) : null;

        var toggleDetailsFn = function toggleDetailsFn() {
          if ($detailsSlot) {
            _this2.$set(item, '_showDetails', !item._showDetails);
          }
        }; // For each item data field in row


        var $tds = fields.map(function (field, colIndex) {
          return _this2.renderTbodyRowCell(field, colIndex, item, rowIndex);
        }); // Calculate the row number in the dataset (indexed from 1)

        var ariaRowIndex = null;

        if (this.currentPage && this.perPage && this.perPage > 0) {
          ariaRowIndex = String((this.currentPage - 1) * this.perPage + rowIndex + 1);
        } // Create a unique :key to help ensure that sub components are re-rendered rather than
        // re-used, which can cause issues. If a primary key is not provided we use the rendered
        // rows index within the tbody.
        // See: https://github.com/bootstrap-vue/bootstrap-vue/issues/2410


        var primaryKey = this.primaryKey;
        var rowKey = primaryKey && !isUndefined(item[primaryKey]) && !isNull(item[primaryKey]) ? toString$1(item[primaryKey]) : String(rowIndex); // If primary key is provided, use it to generate a unique ID on each tbody > tr
        // In the format of '{tableId}__row_{primaryKeyValue}'

        var rowId = primaryKey && !isUndefined(item[primaryKey]) && !isNull(item[primaryKey]) ? this.safeId("_row_".concat(item[primaryKey])) : null;
        var handlers = {};

        if (hasRowClickHandler) {
          handlers['click'] = function (evt) {
            _this2.rowClicked(evt, item, rowIndex);
          };

          handlers['keydown'] = function (evt) {
            _this2.tbodyRowKeydown(evt, item, rowIndex);
          };
        } // Add the item row


        $rows.push(h('tr', {
          key: "__b-table-row-".concat(rowKey, "__"),
          ref: 'itemRows',
          refInFor: true,
          class: [this.rowClasses(item), this.selectableRowClasses(rowIndex), {
            'b-table-has-details': rowShowDetails
          }],
          attrs: _objectSpread({
            id: rowId,
            tabindex: hasRowClickHandler ? '0' : null,
            'data-pk': rowId ? String(item[primaryKey]) : null,
            'aria-describedby': detailsId,
            'aria-owns': detailsId,
            'aria-rowindex': ariaRowIndex,
            role: 'row'
          }, this.selectableRowAttrs(rowIndex)),
          on: _objectSpread({}, handlers, {
            // TODO: Instantiate the following handlers only if we have registered
            //       listeners i.e. this.$listeners['row-middle-clicked'], etc.
            auxclick: function auxclick(evt) {
              if (evt.which === 2) {
                _this2.middleMouseRowClicked(evt, item, rowIndex);
              }
            },
            contextmenu: function contextmenu(evt) {
              _this2.rowContextmenu(evt, item, rowIndex);
            },
            // Note: these events are not accessibility friendly!
            dblclick: function dblclick(evt) {
              _this2.rowDblClicked(evt, item, rowIndex);
            },
            mouseenter: function mouseenter(evt) {
              _this2.rowHovered(evt, item, rowIndex);
            },
            mouseleave: function mouseleave(evt) {
              _this2.rowUnhovered(evt, item, rowIndex);
            }
          })
        }, $tds)); // Row Details slot

        if (rowShowDetails) {
          var tdAttrs = {
            colspan: String(fields.length),
            role: 'cell'
          };
          var trAttrs = {
            id: detailsId,
            role: 'row' // Render the details slot

          };
          var $details = h('td', {
            attrs: tdAttrs
          }, [$detailsSlot({
            item: item,
            index: rowIndex,
            fields: fields,
            toggleDetails: toggleDetailsFn
          })]); // Add a hidden row to keep table row striping consistent when details showing

          if (tableStriped) {
            $rows.push(h('tr', {
              key: "__b-table-details-".concat(rowIndex, "-stripe__"),
              staticClass: 'd-none',
              attrs: {
                'aria-hidden': 'true',
                role: 'presentation'
              }
            }));
          } // Add the actual details row


          $rows.push(h('tr', {
            key: "__b-table-details-".concat(rowIndex, "__"),
            staticClass: 'b-table-details',
            class: [isFunction(this.tbodyTrClass) ? this.tbodyTrClass(item, 'row-details') : this.tbodyTrClass],
            attrs: trAttrs
          }, [$details]));
        } else if ($detailsSlot) {
          // Only add the placeholder if a the table has a row-details slot defined (but not shown)
          $rows.push(h(false));

          if (tableStriped) {
            // add extra placeholder if table is striped
            $rows.push(h(false));
          }
        } // Return the row(s)


        return $rows;
      }
    }
  };

  var emptyMixin = {
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
              domProps: this.isFiltered ? htmlOrText(this.emptyFilteredHtml, this.emptyFilteredText) : htmlOrText(this.emptyHtml, this.emptyText)
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
            class: [isFunction(this.tbodyTrClass) ? this.tbodyTrClass(null, 'row-empty') : this.tbodyTrClass],
            attrs: {
              role: 'row'
            }
          }, [$empty]);
        }

        return $empty || h(false);
      }
    }
  };

  var topRowMixin = {
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
          class: [isFunction(this.tbodyTrClass) ? this.tbodyTrClass(null, 'row-top') : this.tbodyTrClass],
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

  var bottomRowMixin = {
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
          class: [isFunction(this.tbodyTrClass) ? this.tbodyTrClass(null, 'row-bottom') : this.tbodyTrClass],
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

  var tbodyMixin = {
    mixins: [tbodyRowMixin, emptyMixin, topRowMixin, bottomRowMixin],
    props: {
      tbodyClass: {
        type: [String, Array],
        default: null
      },
      tbodyTransitionProps: {
        type: Object // default: undefined

      },
      tbodyTransitionHandlers: {
        type: Object // default: undefined

      }
    },
    methods: {
      renderTbody: function renderTbody() {
        var _this = this;

        // Render the tbody element and children
        var h = this.$createElement;
        var items = this.computedItems; // Prepare the tbody rows

        var $rows = []; // Add the item data rows or the busy slot

        var $busy = this.renderBusy();

        if ($busy) {
          // If table is busy and a busy slot, then return only the busy "row" indicator
          $rows.push($busy);
        } else {
          // Table isn't bsuy, or we don't have a busy slot
          // Add static Top Row slot (hidden in visibly stacked mode as we can't control the data-label)
          $rows.push(this.renderTopRow()); // render the rows

          items.forEach(function (item, rowIndex) {
            // Render the individual item row (rows if details slot)
            $rows.push(_this.renderTbodyRow(item, rowIndex));
          }); // Empty Items / Empty Filtered Row slot (only shows if items.length < -

          $rows.push(this.renderEmpty()); // Static bottom row slot (hidden in visibly stacked mode as we can't control the data-label)

          $rows.push(this.renderBottomRow());
        } // If tbody transition enabled


        var isTransGroup = this.tbodyTransitionProps || this.tbodyTransitionHandlers;
        var tbodyProps = {};
        var tbodyOn = {};

        if (isTransGroup) {
          tbodyOn = this.tbodyTransitionHandlers || {};
          tbodyProps = _objectSpread({}, this.tbodyTransitionProps || {}, {
            tag: 'tbody'
          });
        } // Assemble rows into the tbody


        var $tbody = h(isTransGroup ? 'transition-group' : 'tbody', {
          props: tbodyProps,
          on: tbodyOn,
          class: [this.tbodyClass],
          attrs: {
            role: 'rowgroup'
          }
        }, $rows); // Return the assembled tbody

        return $tbody;
      }
    }
  };

  var busyMixin = {
    props: {
      busy: {
        type: Boolean,
        default: false
      }
    },
    data: function data() {
      return {
        localBusy: false
      };
    },
    computed: {
      computedBusy: function computedBusy() {
        return this.busy || this.localBusy;
      }
    },
    watch: {
      localBusy: function localBusy(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.$emit('update:busy', newVal);
        }
      }
    },
    methods: {
      // Event handler helper
      stopIfBusy: function stopIfBusy(evt) {
        if (this.computedBusy) {
          // If table is busy (via provider) then don't propagate
          evt.preventDefault();
          evt.stopPropagation();
          return true;
        }

        return false;
      },
      // Renter the busy indicator or return null if not busy
      renderBusy: function renderBusy() {
        var h = this.$createElement; // Return a busy indicator row, or null if not busy

        if (this.computedBusy && this.hasNormalizedSlot('table-busy')) {
          // Show the busy slot
          var trAttrs = {
            role: this.isStacked ? 'row' : null
          };
          var tdAttrs = {
            colspan: String(this.computedFields.length),
            role: this.isStacked ? 'cell' : null
          };
          return h('tr', {
            key: 'table-busy-slot',
            staticClass: 'b-table-busy-slot',
            class: [isFunction(this.tbodyTrClass) ? this.tbodyTrClass(null, 'table-busy') : this.tbodyTrClass],
            attrs: trAttrs
          }, [h('td', {
            attrs: tdAttrs
          }, [this.normalizeSlot('table-busy', {})])]);
        } else {
          // We return null here so that we can determine if we need to
          // render the table items rows or not.
          return null;
        }
      }
    }
  };

  var selectableMixin = {
    props: {
      selectable: {
        type: Boolean,
        default: false
      },
      selectMode: {
        type: String,
        default: 'multi'
      },
      selectedVariant: {
        type: String,
        default: 'primary'
      }
    },
    data: function data() {
      return {
        selectedRows: [],
        selectedLastRow: -1
      };
    },
    computed: {
      selectableTableClasses: function selectableTableClasses() {
        var _ref;

        var selectable = this.selectable;
        var isSelecting = selectable && this.selectedRows && this.selectedRows.some(Boolean);
        return _ref = {
          'b-table-selectable': selectable
        }, _defineProperty(_ref, "b-table-select-".concat(this.selectMode), selectable), _defineProperty(_ref, 'b-table-selecting', isSelecting), _ref;
      },
      selectableTableAttrs: function selectableTableAttrs() {
        return {
          'aria-multiselectable': this.selectableIsMultiSelect
        };
      },
      selectableIsMultiSelect: function selectableIsMultiSelect() {
        if (this.selectable) {
          return arrayIncludes(['range', 'multi'], this.selectMode) ? 'true' : 'false';
        } else {
          return null;
        }
      }
    },
    watch: {
      computedItems: function computedItems(newVal, oldVal) {
        // Reset for selectable
        // TODO: Should selectedLastClicked be reset here?
        //       As changes to _showDetails would trigger it to reset
        this.selectedLastRow = -1;
        var equal = false;

        if (this.selectable && this.selectedRows.length > 0) {
          // Quick check against array length
          equal = isArray$1(newVal) && isArray$1(oldVal) && newVal.length === oldVal.length;

          for (var i = 0; equal && i < newVal.length; i++) {
            // Look for the first non-loosely equal row, after ignoring reserved fields
            equal = looseEqual(sanitizeRow(newVal[i]), sanitizeRow(oldVal[i]));
          }
        }

        if (!equal) {
          this.clearSelected();
        }
      },
      selectable: function selectable(newVal, oldVal) {
        this.clearSelected();
        this.setSelectionHandlers(newVal);
      },
      selectMode: function selectMode(newVal, oldVal) {
        this.clearSelected();
      },
      selectedRows: function selectedRows(_selectedRows, oldVal) {
        var _this = this;

        if (this.selectable && !looseEqual(_selectedRows, oldVal)) {
          var items = []; // forEach skips over non-existant indicies (on sparse arrays)

          _selectedRows.forEach(function (v, idx) {
            if (v) {
              items.push(_this.computedItems[idx]);
            }
          });

          this.$emit('row-selected', items);
        }
      }
    },
    beforeMount: function beforeMount() {
      // Set up handlers
      if (this.selectable) {
        this.setSelectionHandlers(true);
      }
    },
    methods: {
      isRowSelected: function isRowSelected(idx) {
        return Boolean(this.selectedRows[idx]);
      },
      selectableRowClasses: function selectableRowClasses(idx) {
        var rowSelected = this.isRowSelected(idx);
        var base = this.dark ? 'bg' : 'table';
        var variant = this.selectedVariant;
        return _defineProperty({
          'b-table-row-selected': this.selectable && rowSelected
        }, "".concat(base, "-").concat(variant), this.selectable && rowSelected && variant);
      },
      selectableRowAttrs: function selectableRowAttrs(idx) {
        return {
          'aria-selected': !this.selectable ? null : this.isRowSelected(idx) ? 'true' : 'false'
        };
      },
      clearSelected: function clearSelected() {
        var hasSelection = this.selectedRows.reduce(function (prev, v) {
          return prev || v;
        }, false);

        if (hasSelection) {
          this.selectedLastClicked = -1;
          this.selectedRows = [];
        }
      },
      setSelectionHandlers: function setSelectionHandlers(on) {
        var method = on ? '$on' : '$off'; // Handle row-clicked event

        this[method]('row-clicked', this.selectionHandler); // Clear selection on filter, pagination, and sort changes

        this[method]('filtered', this.clearSelected);
        this[method]('context-changed', this.clearSelected);
      },
      selectionHandler: function selectionHandler(item, index, evt) {
        /* istanbul ignore if: should never happen */
        if (!this.selectable) {
          // Don't do anything if table is not in selectable mode

          /* istanbul ignore next: should never happen */
          this.clearSelected();
          /* istanbul ignore next: should never happen */

          return;
        }

        var selectedRows = this.selectedRows.slice();
        var selected = !selectedRows[index];
        var mode = this.selectMode; // Note 'multi' mode needs no special handling

        if (mode === 'single') {
          selectedRows = [];
        } else if (mode === 'range') {
          if (this.selectedLastRow > -1 && evt.shiftKey) {
            // range
            for (var idx = Math.min(this.selectedLastRow, index); idx <= Math.max(this.selectedLastRow, index); idx++) {
              selectedRows[idx] = true;
            }

            selected = true;
          } else {
            if (!(evt.ctrlKey || evt.metaKey)) {
              // clear range selection if any
              selectedRows = [];
              selected = true;
            }

            this.selectedLastRow = selected ? index : -1;
          }
        }

        selectedRows[index] = selected;
        this.selectedRows = selectedRows;
      }
    }
  };

  var providerMixin = {
    mixins: [listenOnRootMixin],
    props: {
      noProviderPaging: {
        type: Boolean,
        default: false
      },
      noProviderSorting: {
        type: Boolean,
        default: false
      },
      noProviderFiltering: {
        type: Boolean,
        default: false
      },
      apiUrl: {
        // Passthrough prop. Passed to the context object. Not used by b-table directly
        type: String,
        default: ''
      }
    },
    computed: {
      hasProvider: function hasProvider() {
        return this.items instanceof Function;
      },
      providerTriggerContext: function providerTriggerContext() {
        // Used to trigger the provider function via a watcher. Only the fields that
        // are needed for triggering a provider update are included. Note that the
        // regular this.context is sent to the provider during fetches though, as they
        // may need all the prop info.
        var ctx = {
          apiUrl: this.apiUrl
        };

        if (!this.noProviderFiltering) {
          // Either a string, or could be an object or array.
          ctx.filter = this.localFilter;
        }

        if (!this.noProviderSorting) {
          ctx.sortBy = this.localSortBy;
          ctx.sortDesc = this.localSortDesc;
        }

        if (!this.noProviderPaging) {
          ctx.perPage = this.perPage;
          ctx.currentPage = this.currentPage;
        }

        return ctx;
      }
    },
    watch: {
      // Provider update triggering
      items: function items(newVal, oldVal) {
        // If a new provider has been specified, trigger an update
        if (this.hasProvider || newVal instanceof Function) {
          this.$nextTick(this._providerUpdate);
        }
      },
      providerTriggerContext: function providerTriggerContext(newVal, oldVal) {
        // Trigger the provider to update as the relevant context values have changed.
        if (!looseEqual(newVal, oldVal)) {
          this.$nextTick(this._providerUpdate);
        }
      }
    },
    mounted: function mounted() {
      var _this = this;

      // Call the items provider if necessary
      if (this.hasProvider && (!this.localItems || this.localItems.length === 0)) {
        // Fetch on mount if localItems is empty
        this._providerUpdate();
      } // Listen for global messages to tell us to force refresh the table


      this.listenOnRoot('bv::refresh::table', function (id) {
        if (id === _this.id || id === _this) {
          _this.refresh();
        }
      });
    },
    methods: {
      refresh: function refresh() {
        // Public Method: Force a refresh of the provider function
        this.$off('refreshed', this.refresh);

        if (this.computedBusy) {
          // Can't force an update when forced busy by user (busy prop === true)
          if (this.localBusy && this.hasProvider) {
            // But if provider running (localBusy), re-schedule refresh once `refreshed` emitted
            this.$on('refreshed', this.refresh);
          }
        } else {
          this.clearSelected();

          if (this.hasProvider) {
            this.$nextTick(this._providerUpdate);
          } else {
            /* istanbul ignore next */
            this.localItems = isArray$1(this.items) ? this.items.slice() : [];
          }
        }
      },
      // Provider related methods
      _providerSetLocal: function _providerSetLocal(items) {
        this.localItems = isArray$1(items) ? items.slice() : [];
        this.localBusy = false;
        this.$emit('refreshed'); // New root emit

        if (this.id) {
          this.emitOnRoot('bv::table::refreshed', this.id);
        }
      },
      _providerUpdate: function _providerUpdate() {
        // Refresh the provider function items.
        if (!this.hasProvider) {
          // Do nothing if no provider
          return;
        } // If table is busy, wait until refreshed before calling again


        if (this.computedBusy) {
          // Schedule a new refresh once `refreshed` is emitted
          this.$nextTick(this.refresh);
          return;
        } // Set internal busy state


        this.localBusy = true; // Call provider function with context and optional callback after DOM is fully updated

        this.$nextTick(function () {
          var _this2 = this;

          try {
            // Call provider function passing it the context and optional callback
            var data = this.items(this.context, this._providerSetLocal);

            if (data && data.then && isFunction(data.then)) {
              // Provider returned Promise
              data.then(function (items) {
                // Provider resolved with items
                _this2._providerSetLocal(items);
              });
            } else if (isArray$1(data)) {
              // Provider returned Array data
              this._providerSetLocal(data);
            } else if (this.items.length !== 2) {
              // Check number of arguments provider function requested
              // Provider not using callback (didn't request second argument), so we clear
              // busy state as most likely there was an error in the provider function

              /* istanbul ignore next */
              warn("b-table provider function didn't request callback and did not return a promise or data");
              /* istanbul ignore next */

              this.localBusy = false;
            }
          } catch (e)
          /* istanbul ignore next */
          {
            // Provider function borked on us, so we spew out a warning
            // and clear the busy state
            warn("b-table provider function error [".concat(e.name, "] ").concat(e.message));
            this.localBusy = false;
            this.$off('refreshed', this.refresh);
          }
        });
      }
    }
  };

  // @vue/component

  var BTable = Vue.extend({
    name: 'BTable',
    // Order of mixins is important.
    // They are merged from left to fight, followed by this component.
    mixins: [idMixin, normalizeSlotMixin, itemsMixin, filteringMixin, sortingMixin, paginationMixin$1, busyMixin, captionMixin, colgroupMixin, theadMixin, tfootMixin, tbodyMixin, selectableMixin, providerMixin],
    // Don't place ATTRS on root element automatically, as table could be wrapped in responsive div
    inheritAttrs: false,
    props: {
      striped: {
        type: Boolean,
        default: false
      },
      bordered: {
        type: Boolean,
        default: false
      },
      borderless: {
        type: Boolean,
        default: false
      },
      outlined: {
        type: Boolean,
        default: false
      },
      dark: {
        type: Boolean,
        default: false
      },
      hover: {
        type: Boolean,
        default: false
      },
      small: {
        type: Boolean,
        default: false
      },
      fixed: {
        type: Boolean,
        default: false
      },
      responsive: {
        type: [Boolean, String],
        default: false
      },
      stacked: {
        type: [Boolean, String],
        default: false
      },
      tableClass: {
        type: [String, Array, Object],
        default: null
      },
      value: {
        // v-model for retrieving the current displayed rows
        type: Array,
        default: function _default() {
          return [];
        }
      }
    },
    data: function data() {
      // Mixins add to data
      return {};
    },
    computed: {
      // Layout related computed props
      isStacked: function isStacked() {
        return this.stacked === '' ? true : this.stacked;
      },
      isResponsive: function isResponsive() {
        var responsive = this.responsive === '' ? true : this.responsive;
        return this.isStacked ? false : responsive;
      },
      responsiveClass: function responsiveClass() {
        return this.isResponsive === true ? 'table-responsive' : this.isResponsive ? "table-responsive-".concat(this.responsive) : '';
      },
      tableClasses: function tableClasses() {
        return [// User supplied classes
        this.tableClass, // Styling classes
        _defineProperty({
          'table-striped': this.striped,
          'table-hover': this.hover && this.computedItems.length > 0 && !this.computedBusy,
          'table-dark': this.dark,
          'table-bordered': this.bordered,
          'table-borderless': this.borderless,
          'table-sm': this.small,
          border: this.outlined,
          // The following are b-table custom styles
          'b-table-fixed': this.fixed,
          'b-table-stacked': this.stacked === true || this.stacked === ''
        }, "b-table-stacked-".concat(this.stacked), this.stacked !== true && this.stacked), // Selectable classes
        this.selectableTableClasses];
      },
      tableAttrs: function tableAttrs() {
        // Preserve user supplied aria-describedby, if provided in $attrs
        var adb = [(this.$attrs || {})['aria-describedby'], this.captionId].filter(Boolean).join(' ') || null;
        var items = this.computedItems;
        var fields = this.computedFields;
        return _objectSpread({
          // We set aria-rowcount before merging in $attrs, in case user has supplied their own
          'aria-rowcount': this.filteredItems.length > items.length ? String(this.filteredItems.length) : null
        }, this.$attrs, {
          // Now we can override any $attrs here
          id: this.safeId(),
          role: this.isStacked ? 'table' : null,
          'aria-busy': this.computedBusy ? 'true' : 'false',
          'aria-colcount': String(fields.length),
          'aria-describedby': adb
        }, this.selectableTableAttrs);
      },
      context: function context() {
        // Current state of sorting, filtering and pagination props/values
        return {
          filter: this.localFilter,
          sortBy: this.localSortBy,
          sortDesc: this.localSortDesc,
          perPage: parseInt(this.perPage, 10) || 0,
          currentPage: parseInt(this.currentPage, 10) || 1,
          apiUrl: this.apiUrl
        };
      },
      computedItems: function computedItems() {
        return this.paginatedItems || [];
      }
    },
    watch: {
      // Watch for changes on computedItems and update the v-model
      computedItems: function computedItems(newVal, oldVal) {
        this.$emit('input', newVal);
      },
      context: function context(newVal, oldVal) {
        // Emit context info for external paging/filtering/sorting handling
        if (!looseEqual(newVal, oldVal)) {
          this.$emit('context-changed', newVal);
        }
      }
    },
    mounted: function mounted() {
      // Initially update the v-model of displayed items
      this.$emit('input', this.computedItems);
    },
    render: function render(h) {
      // Build the caption (from caption mixin)
      var $caption = this.renderCaption(); // Build the colgroup

      var $colgroup = this.renderColgroup(); // Build the thead

      var $thead = this.renderThead(); // Build the tfoot

      var $tfoot = this.renderTfoot(); // Build the tbody

      var $tbody = this.renderTbody(); // Assemble table

      var $table = h('table', {
        key: 'b-table',
        staticClass: 'table b-table',
        class: this.tableClasses,
        attrs: this.tableAttrs
      }, [$caption, $colgroup, $thead, $tfoot, $tbody]); // Add responsive wrapper if needed and return table

      return this.isResponsive ? h('div', {
        key: 'b-table-responsive',
        class: this.responsiveClass
      }, [$table]) : $table;
    }
  });

  var components$y = {
    BTable: BTable
  };
  var index$v = {
    install: installFactory({
      components: components$y
    })
  };

  var navProps = omit(props$H, ['tabs', 'isNavBar']); // -- Utils --
  // Filter function to filter out disabled tabs

  var notDisabled = function notDisabled(tab) {
    return !tab.disabled;
  }; // --- Helper components ---
  // @vue/component


  var BTabButtonHelper = Vue.extend({
    name: 'BTabButtonHelper',
    inject: {
      bvTabs: {
        default: function _default()
        /* istanbul ignore next */
        {
          return {};
        }
      }
    },
    props: {
      // Reference to the child <b-tab> instance
      tab: {
        default: null
      },
      tabs: {
        type: Array,
        default: function _default()
        /* istanbul ignore next */
        {
          return [];
        }
      },
      id: {
        type: String,
        default: null
      },
      controls: {
        type: String,
        default: null
      },
      tabIndex: {
        type: Number,
        default: null
      },
      posInSet: {
        type: Number,
        default: null
      },
      setSize: {
        type: Number,
        default: null
      },
      noKeyNav: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      focus: function focus() {
        if (this.$refs && this.$refs.link && this.$refs.link.focus) {
          this.$refs.link.focus();
        }
      },
      handleEvt: function handleEvt(evt) {
        function stop() {
          evt.preventDefault();
          evt.stopPropagation();
        }

        if (this.tab.disabled) {
          /* istanbul ignore next */
          return;
        }

        var type = evt.type;
        var key = evt.keyCode;
        var shift = evt.shiftKey;

        if (type === 'click') {
          stop();
          this.$emit('click', evt);
        } else if (type === 'keydown' && !this.noKeyNav && key === KEY_CODES.SPACE) {
          // In keynav mode, SPACE press will also trigger a click/select
          stop();
          this.$emit('click', evt);
        } else if (type === 'keydown' && !this.noKeyNav) {
          // For keyboard navigation
          if (key === KEY_CODES.UP || key === KEY_CODES.LEFT || key === KEY_CODES.HOME) {
            stop();

            if (shift || key === KEY_CODES.HOME) {
              this.$emit('first', evt);
            } else {
              this.$emit('prev', evt);
            }
          } else if (key === KEY_CODES.DOWN || key === KEY_CODES.RIGHT || key === KEY_CODES.END) {
            stop();

            if (shift || key === KEY_CODES.END) {
              this.$emit('last', evt);
            } else {
              this.$emit('next', evt);
            }
          }
        }
      }
    },
    render: function render(h) {
      var link = h(BLink, {
        ref: 'link',
        staticClass: 'nav-link',
        class: [{
          active: this.tab.localActive && !this.tab.disabled,
          disabled: this.tab.disabled
        }, this.tab.titleLinkClass, // Apply <b-tabs> `activeNavItemClass` styles when the tab is active
        this.tab.localActive ? this.bvTabs.activeNavItemClass : null],
        props: {
          href: this.tab.href,
          // To be deprecated to always be '#'
          disabled: this.tab.disabled
        },
        attrs: {
          role: 'tab',
          id: this.id,
          // Roving tab index when keynav enabled
          tabindex: this.tabIndex,
          'aria-selected': this.tab.localActive && !this.tab.disabled ? 'true' : 'false',
          'aria-setsize': this.setSize,
          'aria-posinset': this.posInSet,
          'aria-controls': this.controls
        },
        on: {
          click: this.handleEvt,
          keydown: this.handleEvt
        }
      }, [this.tab.$slots.title || this.tab.title]);
      return h('li', {
        staticClass: 'nav-item',
        class: [this.tab.titleItemClass],
        attrs: {
          role: 'presentation'
        }
      }, [link]);
    }
  }); // @vue/component

  var BTabs = Vue.extend({
    name: 'BTabs',
    mixins: [idMixin],
    provide: function provide() {
      return {
        bvTabs: this
      };
    },
    model: {
      prop: 'value',
      event: 'input'
    },
    props: _objectSpread({}, navProps, {
      tag: {
        type: String,
        default: 'div'
      },
      card: {
        type: Boolean,
        default: false
      },
      bottom: {
        type: Boolean,
        default: false
      },
      end: {
        // Synonym for 'bottom'
        type: Boolean,
        default: false
      },
      noFade: {
        type: Boolean,
        default: false
      },
      noNavStyle: {
        type: Boolean,
        default: false
      },
      noKeyNav: {
        type: Boolean,
        default: false
      },
      lazy: {
        // This prop is sniffed by the <b-tab> child
        type: Boolean,
        default: false
      },
      contentClass: {
        type: [String, Array, Object],
        default: null
      },
      navClass: {
        type: [String, Array, Object],
        default: null
      },
      navWrapperClass: {
        type: [String, Array, Object],
        default: null
      },
      activeNavItemClass: {
        // Only applied to the currently active <b-nav-item>
        type: [String, Array, Object],
        default: null
      },
      activeTabClass: {
        // Only applied to the currently active <b-tab>
        // This prop is sniffed by the <b-tab> child
        type: [String, Array, Object],
        default: null
      },
      value: {
        // v-model
        type: Number,
        default: null
      }
    }),
    data: function data() {
      var tabIdx = parseInt(this.value, 10);
      tabIdx = isNaN(tabIdx) ? -1 : tabIdx;
      return {
        // Index of current tab
        currentTab: tabIdx,
        // Array of direct child <b-tab> instances
        tabs: []
      };
    },
    computed: {
      fade: function fade() {
        // This computed prop is sniffed by the tab child
        return !this.noFade;
      },
      navStyle: function navStyle() {
        return this.pills ? 'pills' : 'tabs';
      },
      localNavClass: function localNavClass() {
        var classes = [];

        if (this.card) {
          if (this.vertical) {
            classes.push('card-header', 'h-100', 'border-bottom-0', 'rounded-0');
          } else {
            classes.push("card-header-".concat(this.navStyle));
          }
        }

        return [].concat(classes, [this.navClass]);
      }
    },
    watch: {
      currentTab: function currentTab(val, old) {
        var index = -1; // Ensure only one tab is active at most

        this.tabs.forEach(function (tab, idx) {
          if (val === idx && !tab.disabled) {
            tab.localActive = true;
            index = idx;
          } else {
            tab.localActive = false;
          }
        }); // Update the v-model

        this.$emit('input', index);
      },
      value: function value(val, old) {
        if (val !== old) {
          val = parseInt(val, 10);
          val = isNaN(val) ? -1 : val;
          old = parseInt(old, 10) || 0;
          var tabs = this.tabs;

          if (tabs[val] && !tabs[val].disabled) {
            this.currentTab = val;
          } else {
            // Try next or prev tabs
            if (val < old) {
              this.previousTab();
            } else {
              this.nextTab();
            }
          }
        }
      }
    },
    created: function created() {
      var _this = this;

      var tabIdx = parseInt(this.value, 10);
      this.currentTab = isNaN(tabIdx) ? -1 : tabIdx; // Create private non-reactive prop

      this._bvObserver = null; // For SSR and to make sure only a single tab is shown on mount
      // We wrap this in a `$nextTick()` to ensure the child tabs have been created

      this.$nextTick(function () {
        _this.updateTabs();
      });
    },
    mounted: function mounted() {
      var _this2 = this;

      this.$nextTick(function () {
        // Call `updateTabs()` just in case...
        _this2.updateTabs(); // Observe child changes so we can update list of tabs


        _this2.setObserver(true);
      });
    },
    deactivated: function deactivated()
    /* istanbul ignore next */
    {
      this.setObserver(false);
    },
    activated: function activated()
    /* istanbul ignore next */
    {
      var _this3 = this;

      var tabIdx = parseInt(this.value, 10);
      this.currentTab = isNaN(tabIdx) ? -1 : tabIdx;
      this.$nextTick(function () {
        _this3.updateTabs();

        _this3.setObserver(true);
      });
    },
    beforeDestroy: function beforeDestroy()
    /* istanbul ignore next */
    {
      this.setObserver(false);
    },
    methods: {
      setObserver: function setObserver(on) {
        if (on) {
          // Make sure no existing observer running
          this.setObserver(false); // Watch for changes to <b-tab> sub components

          this._bvObserver = observeDom(this.$refs.tabsContainer, this.updateTabs.bind(this), {
            childList: true,
            subtree: false,
            attributes: true,
            attributeFilter: ['style', 'class']
          });
        } else {
          if (this._bvObserver && this._bvObserver.disconnect) {
            this._bvObserver.disconnect();
          }

          this._bvObserver = null;
        }
      },
      getTabs: function getTabs() {
        return (this.$slots.default || []).map(function (vnode) {
          return vnode.componentInstance;
        }).filter(function (tab) {
          return tab && tab._isTab;
        });
      },
      // Update list of <b-tab> children
      updateTabs: function updateTabs() {
        // Probe tabs
        var tabs = this.getTabs(); // Find *last* active non-disabled tab in current tabs
        // We trust tab state over currentTab, in case tabs were added/removed/re-ordered

        var tabIndex = tabs.indexOf(tabs.slice().reverse().find(function (tab) {
          return tab.localActive && !tab.disabled;
        })); // Else try setting to currentTab

        if (tabIndex < 0) {
          var currentTab = this.currentTab;

          if (currentTab >= tabs.length) {
            // Handle last tab being removed, so find the last non-disabled tab
            tabIndex = tabs.indexOf(tabs.slice().reverse().find(notDisabled));
          } else if (tabs[currentTab] && !tabs[currentTab].disabled) {
            // Current tab is not disabled
            tabIndex = currentTab;
          }
        } // Else find *first* non-disabled tab in current tabs


        if (tabIndex < 0) {
          tabIndex = tabs.indexOf(tabs.find(notDisabled));
        } // Set the current tab state to active


        tabs.forEach(function (tab, idx) {
          // tab.localActive = idx === tabIndex && !tab.disabled
          tab.localActive = false;
        });

        if (tabs[tabIndex]) {
          tabs[tabIndex].localActive = true;
        } // Update the array of tab children


        this.tabs = tabs; // Set the currentTab index (can be -1 if no non-disabled tabs)

        this.currentTab = tabIndex;
      },
      // Find a button that controls a tab, given the tab reference
      // Returns the button vm instance
      getButtonForTab: function getButtonForTab(tab) {
        return (this.$refs.buttons || []).find(function (btn) {
          return btn.tab === tab;
        });
      },
      // Force a button to re-render it's content, given a <b-tab> instance
      // Called by <b-tab> on `update()`
      updateButton: function updateButton(tab) {
        var button = this.getButtonForTab(tab);

        if (button && button.$forceUpdate) {
          button.$forceUpdate();
        }
      },
      // Activate a tab given a <b-tab> instance
      // Also accessed by <b-tab>
      activateTab: function activateTab(tab) {
        var result = false;

        if (tab) {
          var index = this.tabs.indexOf(tab);

          if (!tab.disabled && index > -1) {
            result = true;
            this.currentTab = index;
          }
        }

        if (!result) {
          // Couldn't set tab, so ensure v-model is set to `this.currentTab`

          /* istanbul ignore next: should rarely happen */
          this.$emit('input', this.currentTab);
        }

        return result;
      },
      // Deactivate a tab given a <b-tab> instance
      // Accessed by <b-tab>
      deactivateTab: function deactivateTab(tab) {
        if (tab) {
          // Find first non-disabled tab that isn't the one being deactivated
          // If no tabs are available, then don't deactivate current tab
          return this.activateTab(this.tabs.filter(function (t) {
            return t !== tab;
          }).find(notDisabled));
        } else {
          // No tab specified

          /* istanbul ignore next: should never happen */
          return false;
        }
      },
      // Focus a tab button given it's <b-tab> instance
      focusButton: function focusButton(tab) {
        var _this4 = this;

        // Wrap in `$nextTick()` to ensure DOM has completed rendering/updating before focusing
        this.$nextTick(function () {
          var button = _this4.getButtonForTab(tab);

          if (button && button.focus) {
            button.focus();
          }
        });
      },
      // Emit a click event on a specified <b-tab> component instance
      emitTabClick: function emitTabClick(tab, evt) {
        if (evt && evt instanceof Event && tab && tab.$emit && !tab.disabled) {
          tab.$emit('click', evt);
        }
      },
      // Click handler
      clickTab: function clickTab(tab, evt) {
        this.activateTab(tab);
        this.emitTabClick(tab, evt);
      },
      // Move to first non-disabled tab
      firstTab: function firstTab(focus) {
        var tab = this.tabs.find(notDisabled);

        if (this.activateTab(tab) && focus) {
          this.focusButton(tab);
          this.emitTabClick(tab, focus);
        }
      },
      // Move to previous non-disabled tab
      previousTab: function previousTab(focus) {
        var currentIndex = Math.max(this.currentTab, 0);
        var tab = this.tabs.slice(0, currentIndex).reverse().find(notDisabled);

        if (this.activateTab(tab) && focus) {
          this.focusButton(tab);
          this.emitTabClick(tab, focus);
        }
      },
      // Move to next non-disabled tab
      nextTab: function nextTab(focus) {
        var currentIndex = Math.max(this.currentTab, -1);
        var tab = this.tabs.slice(currentIndex + 1).find(notDisabled);

        if (this.activateTab(tab) && focus) {
          this.focusButton(tab);
          this.emitTabClick(tab, focus);
        }
      },
      // Move to last non-disabled tab
      lastTab: function lastTab(focus) {
        var tab = this.tabs.slice().reverse().find(notDisabled);

        if (this.activateTab(tab) && focus) {
          this.focusButton(tab);
          this.emitTabClick(tab, focus);
        }
      }
    },
    render: function render(h) {
      var _this5 = this;

      var tabs = this.tabs; // Currently active tab

      var activeTab = tabs.find(function (tab) {
        return tab.localActive && !tab.disabled;
      }); // Tab button to allow focusing when no active tab found (keynav only)

      var fallbackTab = tabs.find(function (tab) {
        return !tab.disabled;
      }); // For each <b-tab> found create the tab buttons

      var buttons = tabs.map(function (tab, index) {
        var tabIndex = null; // Ensure at least one tab button is focusable when keynav enabled (if possible)

        if (!_this5.noKeyNav) {
          // Buttons are not in tab index unless active, or a fallback tab
          tabIndex = -1;

          if (activeTab === tab || !activeTab && fallbackTab === tab) {
            // Place tab button in tab sequence
            tabIndex = null;
          }
        }

        return h(BTabButtonHelper, {
          key: tab._uid || index,
          ref: 'buttons',
          // Needed to make `this.$refs.buttons` an array
          refInFor: true,
          props: {
            tab: tab,
            tabs: tabs,
            id: tab.controlledBy || (_this5.tab && _this5.tab.safeId ? _this5.tab.safeId("_BV_tab_button_") : null),
            controls: _this5.tab && _this5.tab.safeId ? _this5.tab.safeId() : null,
            tabIndex: tabIndex,
            setSize: tabs.length,
            posInSet: index + 1,
            noKeyNav: _this5.noKeyNav
          },
          on: {
            click: function click(evt) {
              _this5.clickTab(tab, evt);
            },
            first: _this5.firstTab,
            prev: _this5.previousTab,
            next: _this5.nextTab,
            last: _this5.lastTab
          }
        });
      }); // Nav

      var nav = h(BNav, {
        ref: 'nav',
        class: this.localNavClass,
        attrs: {
          role: 'tablist',
          id: this.safeId('_BV_tab_controls_')
        },
        props: {
          fill: this.fill,
          justified: this.justified,
          align: this.align,
          tabs: !this.noNavStyle && !this.pills,
          pills: !this.noNavStyle && this.pills,
          vertical: this.vertical,
          small: this.small
        }
      }, [buttons, this.$slots.tabs]);
      nav = h('div', {
        key: 'bv-tabs-nav',
        class: [{
          'card-header': this.card && !this.vertical && !(this.end || this.bottom),
          'card-footer': this.card && !this.vertical && (this.end || this.bottom),
          'col-auto': this.vertical
        }, this.navWrapperClass]
      }, [nav]);
      var empty = h(false);

      if (!tabs || tabs.length === 0) {
        empty = h('div', {
          key: 'empty-tab',
          class: ['tab-pane', 'active', {
            'card-body': this.card
          }]
        }, this.$slots.empty);
      } // Main content section
      // TODO: This container should be a helper component


      var content = h('div', {
        ref: 'tabsContainer',
        key: 'bv-tabs-container',
        staticClass: 'tab-content',
        class: [{
          col: this.vertical
        }, this.contentClass],
        attrs: {
          id: this.safeId('_BV_tab_container_')
        }
      }, [this.$slots.default, empty]); // Render final output

      return h(this.tag, {
        staticClass: 'tabs',
        class: {
          row: this.vertical,
          'no-gutters': this.vertical && this.card
        },
        attrs: {
          id: this.safeId()
        }
      }, [this.end || this.bottom ? content : h(false), [nav], this.end || this.bottom ? h(false) : content]);
    }
  });

  var DEPRECATED_MSG$2 = 'Setting prop "href" is deprecated. Use the <b-nav> component instead.'; // @vue/component

  var BTab = Vue.extend({
    name: 'BTab',
    mixins: [idMixin],
    inject: {
      bvTabs: {
        default: function _default() {
          return {
            // Don't set a tab index if not rendered inside <b-tabs>
            noKeyNav: true
          };
        }
      }
    },
    props: {
      active: {
        type: Boolean,
        default: false
      },
      tag: {
        type: String,
        default: 'div'
      },
      buttonId: {
        type: String,
        default: ''
      },
      title: {
        type: String,
        default: ''
      },
      titleItemClass: {
        // Sniffed by tabs.js and added to nav 'li.nav-item'
        type: [String, Array, Object],
        default: null
      },
      titleLinkClass: {
        // Sniffed by tabs.js and added to nav 'a.nav-link'
        type: [String, Array, Object],
        default: null
      },
      headHtml: {
        // Is this actually ever used?
        type: String,
        default: null
      },
      disabled: {
        type: Boolean,
        default: false
      },
      noBody: {
        type: Boolean,
        default: false
      },
      href: {
        // This should be deprecated, as tabs are not navigation (URL) based
        // <b-nav> + <b-card> + <router-view>/<nuxt-child> should be used instead
        // We don't support router-links here
        type: String,
        default: '#',
        // `deprecated` -> Don't use this prop
        // `deprecation` -> Refers to a change in prop usage
        deprecated: DEPRECATED_MSG$2
      },
      lazy: {
        type: Boolean,
        default: false
      }
    },
    data: function data() {
      return {
        localActive: this.active && !this.disabled,
        show: false
      };
    },
    computed: {
      tabClasses: function tabClasses() {
        return [{
          show: this.show,
          active: this.localActive,
          fade: this.computedFade,
          disabled: this.disabled,
          'card-body': this.bvTabs.card && !this.noBody
        }, // Apply <b-tabs> `activeTabClass` styles when this tab is active
        this.localActive ? this.bvTabs.activeTabClass : null];
      },
      controlledBy: function controlledBy() {
        return this.buttonId || this.safeId('__BV_tab_button__');
      },
      computedFade: function computedFade() {
        return this.bvTabs.fade || false;
      },
      computedLazy: function computedLazy() {
        return this.bvTabs.lazy || this.lazy;
      },
      _isTab: function _isTab() {
        // For parent sniffing of child
        return true;
      }
    },
    watch: {
      localActive: function localActive(newVal, oldVal) {
        // Make 'active' prop work with `.sync` modifier
        this.$emit('update:active', newVal);
      },
      active: function active(newVal, oldVal) {
        if (newVal !== oldVal) {
          if (newVal) {
            // If activated post mount
            this.activate();
          } else {
            if (!this.deactivate()) {
              // Tab couldn't be deactivated, so we reset the synced active prop
              // Deactivation will fail if no other tabs to activate
              this.$emit('update:active', this.localActive);
            }
          }
        }
      },
      disabled: function disabled(newVal, oldVal) {
        if (newVal !== oldVal) {
          if (newVal && this.localActive && this.bvTabs.firstTab) {
            this.localActive = false;
            this.bvTabs.firstTab();
          }
        }
      }
    },
    mounted: function mounted() {
      // Initially show on mount if active and not disabled
      this.show = this.localActive; // Deprecate use of `href` prop

      if (this.href && this.href !== '#') {
        /* istanbul ignore next */
        warn("b-tab: ".concat(DEPRECATED_MSG$2));
      }
    },
    updated: function updated() {
      // Force the tab button content to update (since slots are not reactive)
      // Only done if we have a title slot, as the title prop is reactive
      if (this.$slots.title && this.bvTabs.updateButton) {
        this.bvTabs.updateButton(this);
      }
    },
    methods: {
      // Transition handlers
      beforeEnter: function beforeEnter() {
        var _this = this;

        // Change opacity (add 'show' class) 1 frame after display,
        // otherwise CSS transition won't happen
        requestAF(function () {
          _this.show = true;
        });
      },
      beforeLeave: function beforeLeave() {
        // Remove the 'show' class
        this.show = false;
      },
      // Public methods
      activate: function activate() {
        if (this.bvTabs.activateTab && !this.disabled) {
          return this.bvTabs.activateTab(this);
        } else {
          // Not inside a <b-tabs> component or tab is disabled
          return false;
        }
      },
      deactivate: function deactivate() {
        if (this.bvTabs.deactivateTab && this.localActive) {
          return this.bvTabs.deactivateTab(this);
        } else {
          // Not inside a <b-tabs> component or not active to begin with
          return false;
        }
      }
    },
    render: function render(h) {
      var content = h(this.tag, {
        ref: 'panel',
        staticClass: 'tab-pane',
        class: this.tabClasses,
        directives: [// TODO: Convert to style object in render
        {
          name: 'show',
          rawName: 'v-show',
          value: this.localActive,
          expression: 'localActive'
        }],
        attrs: {
          role: 'tabpanel',
          id: this.safeId(),
          tabindex: this.localActive && !this.bvTabs.noKeyNav ? '0' : null,
          'aria-hidden': this.localActive ? 'false' : 'true',
          'aria-labelledby': this.controlledBy || null
        }
      }, // Render content lazily if requested
      [this.localActive || !this.computedLazy ? this.$slots.default : h(false)]);
      return h('transition', {
        props: {
          mode: 'out-in',
          // Disable use of built-in transition classes
          'enter-class': '',
          'enter-active-class': '',
          'enter-to-class': '',
          'leave-class': '',
          'leave-active-class': '',
          'leave-to-class': ''
        },
        on: {
          beforeEnter: this.beforeEnter,
          beforeLeave: this.beforeLeave
        }
      }, [content]);
    }
  });

  var components$z = {
    BTabs: BTabs,
    BTab: BTab
  };
  var index$w = {
    install: installFactory({
      components: components$z
    })
  };

  function _typeof$1(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof$1 = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof$1 = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof$1(obj);
  }

  function _toConsumableArray$1(arr) {
    return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _nonIterableSpread$1();
  }

  function _arrayWithoutHoles$1(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray$1(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread$1() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function freeze(item) {
    if (Array.isArray(item) || _typeof$1(item) === 'object') {
      return Object.freeze(item);
    }

    return item;
  }
  function combinePassengers(transports) {
    var slotProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return transports.reduce(function (passengers, transport) {
      var temp = transport.passengers[0];
      var newPassengers = typeof temp === 'function' ? temp(slotProps) : transport.passengers;
      return passengers.concat(newPassengers);
    }, []);
  }
  function stableSort$1(array, compareFn) {
    return array.map(function (v, idx) {
      return [idx, v];
    }).sort(function (a, b) {
      return compareFn(a[1], b[1]) || a[0] - b[0];
    }).map(function (c) {
      return c[1];
    });
  }
  function pick(obj, keys) {
    return keys.reduce(function (acc, key) {
      if (obj.hasOwnProperty(key)) {
        acc[key] = obj[key];
      }

      return acc;
    }, {});
  }

  var transports = {};
  var targets = {};
  var sources = {};
  var Wormhole = Vue.extend({
    data: function data() {
      return {
        transports: transports,
        targets: targets,
        sources: sources,
        trackInstances: true
      };
    },
    methods: {
      open: function open(transport) {
        var to = transport.to,
            from = transport.from,
            passengers = transport.passengers,
            _transport$order = transport.order,
            order = _transport$order === void 0 ? Infinity : _transport$order;
        if (!to || !from || !passengers) return;
        var newTransport = {
          to: to,
          from: from,
          passengers: freeze(passengers),
          order: order
        };
        var keys = Object.keys(this.transports);

        if (keys.indexOf(to) === -1) {
          Vue.set(this.transports, to, []);
        }

        var currentIndex = this.$_getTransportIndex(newTransport); // Copying the array here so that the PortalTarget change event will actually contain two distinct arrays

        var newTransports = this.transports[to].slice(0);

        if (currentIndex === -1) {
          newTransports.push(newTransport);
        } else {
          newTransports[currentIndex] = newTransport;
        }

        this.transports[to] = stableSort$1(newTransports, function (a, b) {
          return a.order - b.order;
        });
      },
      close: function close(transport) {
        var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var to = transport.to,
            from = transport.from;
        if (!to || !from) return;

        if (!this.transports[to]) {
          return;
        }

        if (force) {
          this.transports[to] = [];
        } else {
          var index = this.$_getTransportIndex(transport);

          if (index >= 0) {
            // Copying the array here so that the PortalTarget change event will actually contain two distinct arrays
            var newTransports = this.transports[to].slice(0);
            newTransports.splice(index, 1);
            this.transports[to] = newTransports;
          }
        }
      },
      registerTarget: function registerTarget(target, vm, force) {
        if (this.trackInstances && !force && this.targets[target]) {
          console.warn("[portal-vue]: Target ".concat(target, " already exists"));
        }

        this.$set(this.targets, target, Object.freeze([vm]));
      },
      unregisterTarget: function unregisterTarget(target) {
        this.$delete(this.targets, target);
      },
      registerSource: function registerSource(source, vm, force) {
        if (this.trackInstances && !force && this.sources[source]) {
          console.warn("[portal-vue]: source ".concat(source, " already exists"));
        }

        this.$set(this.sources, source, Object.freeze([vm]));
      },
      unregisterSource: function unregisterSource(source) {
        this.$delete(this.sources, source);
      },
      hasTarget: function hasTarget(to) {
        return !!(this.targets[to] && this.targets[to][0]);
      },
      hasSource: function hasSource(to) {
        return !!(this.sources[to] && this.sources[to][0]);
      },
      hasContentFor: function hasContentFor(to) {
        return !!this.transports[to] && !!this.transports[to].length;
      },
      // Internal
      $_getTransportIndex: function $_getTransportIndex(_ref) {
        var to = _ref.to,
            from = _ref.from;

        for (var i in this.transports[to]) {
          if (this.transports[to][i].from === from) {
            return +i;
          }
        }

        return -1;
      }
    }
  });
  var wormhole = new Wormhole(transports);

  var _id = 1;
  var Portal = Vue.extend({
    name: 'portal',
    props: {
      disabled: {
        type: Boolean
      },
      name: {
        type: String,
        default: function _default() {
          return String(_id++);
        }
      },
      order: {
        type: Number,
        default: 0
      },
      slim: {
        type: Boolean
      },
      slotProps: {
        type: Object,
        default: function _default() {
          return {};
        }
      },
      tag: {
        type: String,
        default: 'DIV'
      },
      to: {
        type: String,
        default: function _default() {
          return String(Math.round(Math.random() * 10000000));
        }
      }
    },
    created: function created() {
      wormhole.registerSource(this.name, this);
    },
    mounted: function mounted() {
      if (!this.disabled) {
        this.sendUpdate();
      }
    },
    updated: function updated() {
      if (this.disabled) {
        this.clear();
      } else {
        this.sendUpdate();
      }
    },
    beforeDestroy: function beforeDestroy() {
      wormhole.unregisterSource(this.name);
      this.clear();
    },
    watch: {
      to: function to(newValue, oldValue) {
        oldValue && oldValue !== newValue && this.clear(oldValue);
        this.sendUpdate();
      }
    },
    methods: {
      clear: function clear(target) {
        var closer = {
          from: this.name,
          to: target || this.to
        };
        wormhole.close(closer);
      },
      normalizeSlots: function normalizeSlots() {
        return this.$scopedSlots.default ? [this.$scopedSlots.default] : this.$slots.default;
      },
      normalizeOwnChildren: function normalizeOwnChildren(children) {
        return typeof children === 'function' ? children(this.slotProps) : children;
      },
      sendUpdate: function sendUpdate() {
        var slotContent = this.normalizeSlots();

        if (slotContent) {
          var transport = {
            from: this.name,
            to: this.to,
            passengers: _toConsumableArray$1(slotContent),
            order: this.order
          };
          wormhole.open(transport);
        } else {
          this.clear();
        }
      }
    },
    render: function render(h) {
      var children = this.$slots.default || this.$scopedSlots.default || [];
      var Tag = this.tag;

      if (children && this.disabled) {
        return children.length <= 1 && this.slim ? this.normalizeOwnChildren(children)[0] : h(Tag, [this.normalizeOwnChildren(children)]);
      } else {
        return this.slim ? h() : h(Tag, {
          class: {
            'v-portal': true
          },
          style: {
            display: 'none'
          },
          key: 'v-portal-placeholder'
        });
      }
    }
  });

  var PortalTarget = Vue.extend({
    name: 'portalTarget',
    props: {
      multiple: {
        type: Boolean,
        default: false
      },
      name: {
        type: String,
        required: true
      },
      slim: {
        type: Boolean,
        default: false
      },
      slotProps: {
        type: Object,
        default: function _default() {
          return {};
        }
      },
      tag: {
        type: String,
        default: 'div'
      },
      transition: {
        type: [String, Object, Function]
      }
    },
    data: function data() {
      return {
        transports: wormhole.transports,
        firstRender: true
      };
    },
    created: function created() {
      wormhole.registerTarget(this.name, this);
    },
    watch: {
      ownTransports: function ownTransports() {
        this.$emit('change', this.children().length > 0);
      },
      name: function name(newVal, oldVal) {
        /**
         * TODO
         * This should warn as well ...
         */
        wormhole.unregisterTarget(oldVal);
        wormhole.registerTarget(newVal, this);
      }
    },
    mounted: function mounted() {
      var _this = this;

      if (this.transition) {
        this.$nextTick(function () {
          // only when we have a transition, because it causes a re-render
          _this.firstRender = false;
        });
      }
    },
    beforeDestroy: function beforeDestroy() {
      wormhole.unregisterTarget(this.name);
    },
    computed: {
      ownTransports: function ownTransports() {
        var transports = this.transports[this.name] || [];

        if (this.multiple) {
          return transports;
        }

        return transports.length === 0 ? [] : [transports[transports.length - 1]];
      },
      passengers: function passengers() {
        return combinePassengers(this.ownTransports, this.slotProps);
      }
    },
    methods: {
      // can't be a computed prop because it has to "react" to $slot changes.
      children: function children() {
        return this.passengers.length !== 0 ? this.passengers : this.$scopedSlots.default ? this.$scopedSlots.default(this.slotProps) : this.$slots.default || [];
      },
      // can't be a computed prop because it has to "react" to this.children().
      noWrapper: function noWrapper() {
        var noWrapper = this.slim && !this.transition;

        if (noWrapper && this.children().length > 1) {
          console.warn('[portal-vue]: PortalTarget with `slim` option received more than one child element.');
        }

        return noWrapper;
      }
    },
    render: function render(h) {
      var noWrapper = this.noWrapper();
      var children = this.children();
      var Tag = this.transition || this.tag;
      return noWrapper ? children[0] : this.slim && !Tag ? h() : h(Tag, {
        props: {
          // if we have a transition component, pass the tag if it exists
          tag: this.transition && this.tag ? this.tag : undefined
        },
        class: {
          'vue-portal-target': true
        }
      }, children);
    }
  });

  var _id$1 = 0;
  var portalProps = ['disabled', 'name', 'order', 'slim', 'slotProps', 'tag', 'to'];
  var targetProps = ['multiple', 'transition'];
  var MountingPortal = Vue.extend({
    name: 'MountingPortal',
    inheritAttrs: false,
    props: {
      append: {
        type: [Boolean, String]
      },
      bail: {
        type: Boolean
      },
      mountTo: {
        type: String,
        required: true
      },
      // Portal
      disabled: {
        type: Boolean
      },
      // name for the portal
      name: {
        type: String,
        default: function _default() {
          return 'mounted_' + String(_id$1++);
        }
      },
      order: {
        type: Number,
        default: 0
      },
      slim: {
        type: Boolean
      },
      slotProps: {
        type: Object,
        default: function _default() {
          return {};
        }
      },
      tag: {
        type: String,
        default: 'DIV'
      },
      // name for the target
      to: {
        type: String,
        default: function _default() {
          return String(Math.round(Math.random() * 10000000));
        }
      },
      // Target
      multiple: {
        type: Boolean,
        default: false
      },
      targetSlotProps: {
        type: Object,
        default: function _default() {
          return {};
        }
      },
      targetTag: {
        type: String,
        default: 'div'
      },
      transition: {
        type: [String, Object, Function]
      },
      transitionGroup: {
        type: Boolean
      }
    },
    created: function created() {
      if (typeof document === 'undefined') return;
      var el = document.querySelector(this.mountTo);

      if (!el) {
        console.error("[portal-vue]: Mount Point '".concat(this.mountTo, "' not found in document"));
        return;
      }

      var props = this.$props; // Target already exists

      if (wormhole.targets[props.name]) {
        if (props.bail) {
          console.warn("[portal-vue]: Target ".concat(props.name, " is already mounted.\n        Aborting because 'bail: true' is set"));
        } else {
          this.portalTarget = wormhole.targets[props.name];
        }

        return;
      }

      var append = props.append;

      if (append) {
        var type = typeof append === 'string' ? append : 'DIV';
        var mountEl = document.createElement(type);
        el.appendChild(mountEl);
        el = mountEl;
      } // get props for target from $props
      // we have to rename a few of them


      var _props = pick(this.$props, targetProps);

      _props.tag = this.targetTag;
      _props.slotSprop = this.targetSlotProps;
      _props.name = this.to;
      this.portalTarget = new PortalTarget({
        el: el,
        parent: this.$parent || this,
        propsData: _props
      });
    },
    beforeDestroy: function beforeDestroy() {
      var target = this.portalTarget;

      if (this.append) {
        var el = target.$el;
        el.parentNode.removeChild(el);
      }

      target.$destroy();
    },
    render: function render(h) {
      if (!this.portalTarget) {
        console.warn("[portal-vue] Target wasn't mounted");
        return h();
      } // if there's no "manual" scoped slot, so we create a <Portal> ourselves


      if (!this.$scopedSlots.manual) {
        var props = pick(this.$props, portalProps);
        return h(Portal, {
          props: props,
          attrs: this.$attrs,
          on: this.$listeners,
          scopedSlots: this.$scopedSlots
        }, this.$slots.default);
      } // else, we render the scoped slot


      var content = this.$scopedSlots.manual({
        to: this.to
      }); // if user used <template> for the scoped slot
      // content will be an array

      if (Array.isArray(content)) {
        content = content[0];
      }

      if (!content) return h();
      return content;
    }
  });

  /* istanbul ignore file: for now until ready for testing */
  // --- Constants ---

  var NAME$g = 'BToaster';
  var props$T = {
    name: {
      type: String,
      required: true
    },
    ariaLive: {
      type: String,
      default: 'polite'
    },
    ariaAtomic: {
      type: String,
      default: 'true' // Allowed: 'true' or 'false'

    },
    role: {
      // Aria role
      type: String,
      default: null
      /*
      transition: {
        type: [Boolean, String, Object],
        default: false
      }
      */

    } // @vue/component

  };
  var DefaultTransition = Vue.extend({
    // functional: true,
    // render(h, { children }) {
    //   return h('transition-group', { props: { tag: 'div', name: 'b-toaster' } }, children)
    data: function data() {
      return {
        // Transition classes base name
        name: 'b-toaster'
      };
    },
    methods: {
      onAfterEnter: function onAfterEnter(el) {
        var _this = this;

        // Handle bug where enter-to class is not removed.
        // Bug is related to portal-vue and transition-groups.
        requestAF(function () {
          removeClass(el, "".concat(_this.name, "-enter-to")); // The *-move class is also stuck on elements that moved,
          // but there are no javascript hooks to handle after move.
        });
      }
    },
    render: function render(h) {
      return h('transition-group', {
        props: {
          tag: 'div',
          name: this.name
        },
        on: {
          afterEnter: this.onAfterEnter
        }
      }, this.$slots.default);
    }
  }); // @vue/component

  var BToaster = Vue.extend({
    name: NAME$g,
    props: props$T,
    data: function data() {
      return {
        // We don't render on SSR or if a an existing target found
        doRender: false,
        dead: false,
        // Toaster names cannot change once created
        staticName: this.name
      };
    },
    beforeMount: function beforeMount() {
      var _this2 = this;

      this.staticName = this.name;
      /* istanbul ignore if */

      if (wormhole.hasTarget(this.staticName)) {
        warn("b-toaster: A <portal-target> with name '".concat(this.name, "' already exists in the document."));
        this.dead = true;
      } else {
        this.doRender = true;
        this.$once('hook:beforeDestroy', function () {
          // Let toasts made with `this.$bvToast.toast()` know that this toaster
          // is being destroyed and should should also destroy/hide themselves
          _this2.$root.$emit('bv::toaster::destroyed', _this2.staticName);
        });
      }
    },
    destroyed: function destroyed() {
      // Remove from DOM if needed
      if (this.$el && this.$el.parentNode) {
        this.$el.parentNode.removeChild(this.$el);
      }
    },
    render: function render(h) {
      var $toaster = h('div', {
        class: ['d-none', {
          'b-dead-toaster': this.dead
        }]
      });

      if (this.doRender) {
        var $target = h(PortalTarget, {
          staticClass: 'b-toaster-slot',
          attrs: {
            role: this.role,
            'aria-live': this.ariaLive,
            'aria-atomic': this.ariaAtomic
          },
          props: {
            name: this.staticName,
            multiple: true,
            tag: 'div',
            slim: false,
            // transition: this.transition || DefaultTransition
            transition: DefaultTransition
          }
        });
        $toaster = h('div', {
          staticClass: 'b-toaster',
          class: [this.staticName],
          attrs: {
            id: this.staticName
          }
        }, [$target]);
      }

      return $toaster;
    }
  });

  /* istanbul ignore file: for now until ready for testing */
  // --- Constants ---

  var NAME$h = 'BToast';
  var MIN_DURATION = 1000;
  var props$U = {
    id: {
      type: String,
      default: null
    },
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: null
    },
    toaster: {
      type: String,
      default: function _default() {
        return getComponentConfig(NAME$h, 'toaster') || 'b-toaster-top-right';
      }
    },
    isStatus: {
      // Switches role to 'status' and aria-live to 'polite'
      type: Boolean,
      default: false
    },
    appendToast: {
      type: Boolean,
      default: false
    },
    noAutoHide: {
      type: Boolean,
      default: false
    },
    autoHideDelay: {
      type: [Number, String],
      default: 5000
    },
    noCloseButton: {
      type: Boolean,
      default: false
    },
    noFade: {
      type: Boolean,
      default: false
    },
    noHoverPause: {
      type: Boolean,
      default: false
    },
    solid: {
      type: Boolean,
      default: false
    },
    toastClass: {
      type: [String, Object, Array],
      default: ''
    },
    headerClass: {
      type: [String, Object, Array],
      default: ''
    },
    bodyClass: {
      type: [String, Object, Array],
      default: ''
    },
    href: {
      type: String,
      default: null
    },
    to: {
      type: [String, Object],
      default: null
    },
    static: {
      // Render the toast in place, rather than in a portal-target
      type: Boolean,
      default: false
    } // Transition props defaults

  };
  var DEFAULT_TRANSITION_PROPS = {
    name: '',
    enterClass: '',
    enterActiveClass: '',
    enterToClass: '',
    leaveClass: 'show',
    leaveActiveClass: '',
    leaveToClass: '' // @vue/component

  };
  var BToast = Vue.extend({
    name: NAME$h,
    mixins: [listenOnRootMixin, normalizeSlotMixin],
    inheritAttrs: false,
    model: {
      prop: 'visible',
      event: 'change'
    },
    props: props$U,
    data: function data() {
      return {
        isMounted: false,
        doRender: false,
        localShow: false,
        showClass: false,
        isTransitioning: false,
        order: 0,
        timer: null,
        dismissStarted: 0,
        resumeDismiss: 0
      };
    },
    computed: {
      toastClasses: function toastClasses() {
        return [this.toastClass, {
          show: this.showClass,
          fade: !this.noFade
        }];
      },
      bToastClasses: function bToastClasses() {
        return _defineProperty({
          'b-toast-solid': this.solid,
          'b-toast-append': this.appendToast,
          'b-toast-prepend': !this.appendToast
        }, "b-toast-".concat(this.variant), this.variant);
      },
      slotScope: function slotScope() {
        return {
          hide: this.hide
        };
      },
      computedDuration: function computedDuration() {
        // Minimum supported duration is 1 second
        return Math.max(parseInt(this.autoHideDelay, 10) || 0, MIN_DURATION);
      },
      transitionHandlers: function transitionHandlers() {
        return {
          beforeEnter: this.onBeforeEnter,
          afterEnter: this.onAfterEnter,
          beforeLeave: this.onBeforeLeave,
          afterLeave: this.onAfterLeave
        };
      }
    },
    watch: {
      visible: function visible(newVal) {
        newVal ? this.show() : this.hide();
      },
      localShow: function localShow(newVal) {
        if (newVal !== this.visible) {
          this.$emit('change', newVal);
        }
      },
      toaster: function toaster(newVal) {
        var _this = this;

        // If toaster target changed, make sure toaster exists
        this.$nextTick(function () {
          return _this.ensureToaster;
        });
      },
      static: function _static(newVal) {
        // If static changes to true, and the toast is showing,
        // ensure the toaster target exists
        if (newVal && this.localShow) {
          this.ensureToaster();
        }
      }
    },
    mounted: function mounted() {
      var _this2 = this;

      this.isMounted = true;
      this.$nextTick(function () {
        if (_this2.visible) {
          requestAF(function () {
            _this2.show();
          });
        }
      }); // Listen for global $root show events

      this.listenOnRoot('bv::show::toast', function (id) {
        if (id === _this2.id) {
          _this2.show();
        }
      }); // Listen for global $root hide events

      this.listenOnRoot('bv::hide::toast', function (id) {
        if (!id || id === _this2.id) {
          _this2.hide();
        }
      }); // Make sure we hide when toaster is destroyed

      this.listenOnRoot('bv::toaster::destroyed', function (toaster) {
        if (toaster === _this2.toaster) {
          _this2.hide();
        }
      });
    },
    beforeDestroy: function beforeDestroy() {
      this.clearDismissTimer();
    },
    methods: {
      show: function show() {
        var _this3 = this;

        if (!this.localShow) {
          this.ensureToaster();
          var showEvt = this.buildEvent('show');
          this.emitEvent(showEvt);
          this.dismissStarted = this.resumeDismiss = 0;
          this.order = Date.now() * (this.appendToast ? 1 : -1);
          this.doRender = true;
          this.$nextTick(function () {
            // we show the toast after we have rendered the portal
            _this3.localShow = true;
          });
        }
      },
      hide: function hide() {
        if (this.localShow) {
          var hideEvt = this.buildEvent('hide');
          this.emitEvent(hideEvt);
          this.setHoverHandler(false);
          this.dismissStarted = this.resumeDismiss = 0;
          this.clearDismissTimer();
          this.localShow = false;
        }
      },
      buildEvent: function buildEvent(type) {
        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return new BvEvent(type, _objectSpread({
          cancelable: false,
          target: this.$el,
          relatedTarget: null
        }, opts, {
          vueTarget: this,
          componentId: this.id || null,
          toastId: this.id || null
        }));
      },
      emitEvent: function emitEvent(bvEvt) {
        var type = bvEvt.type;
        this.$root.$emit("bv::toast:".concat(type), bvEvt);
        this.$emit(type, bvEvt);
      },
      ensureToaster: function ensureToaster() {
        if (this.static) {
          return;
        }

        if (!wormhole.hasTarget(this.toaster)) {
          var div = document.createElement('div');
          document.body.append(div);
          var toaster = new BToaster({
            parent: this.$root,
            propsData: {
              name: this.toaster
            }
          });
          toaster.$mount(div);
        }
      },
      startDismissTimer: function startDismissTimer() {
        this.clearDismissTimer();

        if (!this.noAutoHide) {
          this.timer = setTimeout(this.hide, this.resumeDismiss || this.computedDuration);
          this.dismissStarted = Date.now();
          this.resumeDismiss = 0;
        }
      },
      clearDismissTimer: function clearDismissTimer() {
        clearTimeout(this.timer);
        this.timer = null;
      },
      setHoverHandler: function setHoverHandler(on) {
        var method = on ? eventOn : eventOff;
        method(this.$refs.btoast, 'mouseenter', this.onPause, {
          passive: true,
          capture: false
        });
        method(this.$refs.btoast, 'mouseleave', this.onUnPause, {
          passive: true,
          capture: false
        });
      },
      onPause: function onPause(evt) {
        // Determine time remaining, and then pause timer
        if (this.noAutoHide || this.noHoverPause || !this.timer || this.resumeDismiss) {
          return;
        }

        var passed = Date.now() - this.dismissStarted;

        if (passed > 0) {
          this.clearDismissTimer();
          this.resumeDismiss = Math.max(this.computedDuration - passed, MIN_DURATION);
        }
      },
      onUnPause: function onUnPause(evt) {
        // Restart with max of time remaining or 1 second
        if (this.noAutoHide || this.noHoverPause || !this.resumeDismiss) {
          this.resumeDismiss = this.dismissStarted = 0;
          return;
        }

        this.startDismissTimer();
      },
      onLinkClick: function onLinkClick() {
        var _this4 = this;

        // We delay the close to allow time for the
        // browser to process the link click
        this.$nextTick(function () {
          requestAF(function () {
            _this4.hide();
          });
        });
      },
      onBeforeEnter: function onBeforeEnter() {
        var _this5 = this;

        this.isTransitioning = true;
        requestAF(function () {
          _this5.showClass = true;
        });
      },
      onAfterEnter: function onAfterEnter() {
        this.isTransitioning = false;
        var hiddenEvt = this.buildEvent('shown');
        this.emitEvent(hiddenEvt);
        this.startDismissTimer();
        this.setHoverHandler(true);
      },
      onBeforeLeave: function onBeforeLeave() {
        var _this6 = this;

        this.isTransitioning = true;
        requestAF(function () {
          _this6.showClass = false;
        });
      },
      onAfterLeave: function onAfterLeave() {
        this.isTransitioning = false;
        this.order = 0;
        this.resumeDismiss = this.dismissStarted = 0;
        var hiddenEvt = this.buildEvent('hidden');
        this.emitEvent(hiddenEvt);
        this.doRender = false;
      },
      makeToast: function makeToast(h) {
        var _this7 = this;

        // Render helper for generating the toast
        // Assemble the header content
        var $headerContent = [];
        var $title = this.normalizeSlot('toast-title', this.slotScope);

        if ($title) {
          $headerContent.push($title);
        } else if (this.title) {
          $headerContent.push(h('strong', {
            staticClass: 'mr-2'
          }, this.title));
        }

        if (!this.noCloseButton) {
          $headerContent.push(h(BButtonClose, {
            staticClass: 'ml-auto mb-1',
            on: {
              click: function click(evt) {
                _this7.hide();
              }
            }
          }));
        } // Assemble the header (if needed)


        var $header = h(false);

        if ($headerContent.length > 0) {
          $header = h('header', {
            staticClass: 'toast-header',
            class: this.headerClass
          }, $headerContent);
        } // Toast body


        var isLink = this.href || this.to;
        var $body = h(isLink ? BLink : 'div', {
          staticClass: 'toast-body',
          class: this.bodyClass,
          props: isLink ? {
            to: this.to,
            href: this.href
          } : {},
          on: isLink ? {
            click: this.onLinkClick
          } : {}
        }, [this.normalizeSlot('default', this.slotScope) || h(false)]); // Build the toast

        var $toast = h('div', {
          key: 'toast',
          ref: 'toast',
          staticClass: 'toast',
          class: this.toastClasses,
          attrs: _objectSpread({}, this.$attrs, {
            id: this.id || null,
            tabindex: '-1',
            role: this.isStatus ? 'status' : 'alert',
            'aria-live': this.isStatus ? 'polite' : 'assertive',
            'aria-atomic': 'true'
          })
        }, [$header, $body]);
        return $toast;
      }
    },
    render: function render(h) {
      if (!this.doRender || !this.isMounted) {
        return h(false);
      }

      var name = "b-toast-".concat(this._uid);
      return h(Portal, {
        props: {
          name: name,
          to: this.toaster,
          order: this.order,
          slim: true,
          disabled: this.static
        }
      }, [h('div', {
        key: name,
        ref: 'btoast',
        staticClass: 'b-toast',
        class: this.bToastClasses
      }, [h('transition', {
        props: DEFAULT_TRANSITION_PROPS,
        on: this.transitionHandlers
      }, [this.localShow ? this.makeToast(h) : null])])]);
    }
  });

  var PROP_NAME$1 = '$bvToast'; // Base toast props that are allowed
  // Some may be ignored or overridden on some message boxes
  // Prop ID is allowed, but really only should be used for testing
  // We need to add it in explicitly as it comes from the `idMixin`

  var BASE_PROPS$1 = ['id'].concat(_toConsumableArray(keys(omit(props$U, ['static', 'visible'])))); // Map prop names to toast slot names

  var propsToSlots$1 = {
    toastContent: 'default',
    title: 'toast-title' // --- Utility methods ---
    // Method to filter only recognized props that are not undefined

  };

  var filterOptions$1 = function filterOptions(options) {
    return BASE_PROPS$1.reduce(function (memo, key) {
      if (!isUndefined(options[key])) {
        memo[key] = options[key];
      }

      return memo;
    }, {});
  }; // Create a private sub-component that extends BToast
  // which self-destructs after hidden
  // @vue/component


  var BToastPop = Vue.extend({
    name: 'BToastPop',
    extends: BToast,
    destroyed: function destroyed() {
      // Make sure we not in document any more
      if (this.$el && this.$el.parentNode) {
        this.$el.parentNode.removeChild(this.$el);
      }
    },
    mounted: function mounted() {
      // Self destruct handler
      var self = this;

      var handleDestroy = function handleDestroy() {
        // Ensure the toast has been force hidden
        self.localShow = false;
        self.doRender = false;
        self.$nextTick(function () {
          self.$nextTick(function () {
            // In a `requestAF()` to release control back to application
            // and to allow the portal-target time to remove the content
            requestAF(function () {
              self.$destroy();
            });
          });
        });
      }; // Self destruct if parent destroyed


      this.$parent.$once('hook:destroyed', handleDestroy); // Self destruct after hidden

      this.$once('hidden', handleDestroy); // Self destruct when toaster is destroyed

      this.listenOnRoot('bv::toaster::destroyed', function (toaster) {
        if (toaster === self.toaster) {
          handleDestroy();
        }
      });
    }
  }); // Method to generate the on-demand toast

  var makeToast = function makeToast(props, $parent) {
    if (warnNotClient(PROP_NAME$1)) {
      // Should this throw an error?

      /* istanbul ignore next */
      return;
    } // Create an instance of `BToast` component


    var toast = new BToastPop({
      // We set parent as the local VM so these toasts can emit events on
      // the app `$root`
      // And it helps to ensure `BToast` is destroyed when parent is destroyed
      parent: $parent,
      // Preset the prop values
      propsData: _objectSpread({}, filterOptions$1(getComponentConfig('BToast') || {}), omit(props, ['toastContent']), {
        // Props that can't be overridden
        static: false,
        visible: true
      })
    }); // Convert certain props to slots

    keys(propsToSlots$1).forEach(function (prop) {
      var value = props[prop];

      if (!isUndefined(value)) {
        // Can be a string, or array of VNodes
        // Alternatively, user can use HTML version of prop to pass an HTML string
        if (prop === 'title' && isString(value)) {
          // Special case for title if it is a string, we wrap in a <strong>
          value = [$parent.$createElement('strong', {
            class: 'mr-2'
          }, value)];
        }

        toast.$slots[propsToSlots$1[prop]] = value;
      }
    }); // Create a mount point (a DIV)
    // TODO: this needs to target a portal-target
    // But we still need to place in document to portal-vue can
    // transfer the content

    var div = document.createElement('div');
    document.body.appendChild(div); // Mount the toast to trigger it to show

    toast.$mount(div);
  }; // BvToast instance property class


  var BvToast =
  /*#__PURE__*/
  function () {
    function BvToast(vm) {
      _classCallCheck(this, BvToast);

      // Assign the new properties to this instance
      assign$1(this, {
        _vm: vm,
        _root: vm.$root
      }); // Set these properties as read-only and non-enumerable

      defineProperties(this, {
        _vm: readonlyDescriptor(),
        _root: readonlyDescriptor()
      });
    } // --- Instance methods ---
    // Opens a user defined toast and returns immediately


    _createClass(BvToast, [{
      key: "toast",
      value: function toast(content) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (!content || warnNotClient(PROP_NAME$1)) {
          // Should this throw an error?

          /* istanbul ignore next */
          return;
        }

        var props = _objectSpread({}, filterOptions$1(options), {
          toastContent: content
        });

        makeToast(props, this._vm);
      } // shows a `<b-toast>` component with the specified ID

    }, {
      key: "show",
      value: function show(id) {
        if (id) {
          this._root.$emit('bv::show::toast', id);
        }
      } // Hide a toast with specified ID, or if not ID all toasts

    }, {
      key: "hide",
      value: function hide() {
        var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        this._root.$emit('bv::hide::toast', id);
      }
    }]);

    return BvToast;
  }(); // Method to install `$bvToast` VM injection


  var install$1 = function install(_Vue) {
    if (install._installed) {
      // Only install once

      /* istanbul ignore next */
      return;
    }

    install._installed = true; // Add our instance mixin

    _Vue.mixin({
      beforeCreate: function beforeCreate() {
        // Because we need access to `$root` for `$emits`, and VM for parenting,
        // we have to create a fresh instance of `BvToast` for each VM
        this._bv__toast = new BvToast(this);
      }
    }); // Define our read-only `$bvToast` instance property
    // Placed in an if just in case in HMR mode


    if (!_Vue.prototype.hasOwnProperty(PROP_NAME$1)) {
      defineProperty(_Vue.prototype, PROP_NAME$1, {
        get: function get() {
          return this._bv__toast;
        }
      });
    }
  };

  var components$A = {
    BToast: BToast,
    BToaster: BToaster
  };

  var _install$1 = installFactory({
    components: components$A
  });

  var index$x = {
    install: function install(Vue) {
      // Inject `$bvToast` into Vue prototype
      install$1(Vue); // Install components

      _install$1(Vue);
    }
  };

  var BTooltip = Vue.extend({
    name: 'BTooltip',
    mixins: [toolpopMixin],
    props: {
      title: {
        type: String,
        default: ''
      },
      triggers: {
        type: [String, Array],
        default: 'hover focus'
      },
      placement: {
        type: String,
        default: 'top'
      }
    },
    data: function data() {
      return {};
    },
    methods: {
      createToolpop: function createToolpop() {
        // getTarget is in toolpop mixin
        var target = this.getTarget();
        /* istanbul ignore else */

        if (target) {
          this._toolpop = new ToolTip(target, this.getConfig(), this.$root);
        } else {
          this._toolpop = null;
          warn("b-tooltip: 'target' element not found!");
        }

        return this._toolpop;
      }
    },
    render: function render(h) {
      return h('div', {
        class: ['d-none'],
        style: {
          display: 'none'
        },
        attrs: {
          'aria-hidden': true
        }
      }, [h('div', {
        ref: 'title'
      }, this.$slots.default)]);
    }
  });

  var BV_TOOLTIP = '__BV_ToolTip__'; // Valid event triggers

  var validTriggers$1 = {
    focus: true,
    hover: true,
    click: true,
    blur: true // Build a ToolTip config based on bindings (if any)
    // Arguments and modifiers take precedence over passed value config object

    /* istanbul ignore next: not easy to test */

  };

  var parseBindings$1 = function parseBindings(bindings)
  /* istanbul ignore next: not easy to test */
  {
    // We start out with a blank config
    var config = {}; // Process bindings.value

    if (isString(bindings.value)) {
      // Value is tooltip content (html optionally supported)
      config.title = bindings.value;
    } else if (isFunction(bindings.value)) {
      // Title generator function
      config.title = bindings.value;
    } else if (isObject(bindings.value)) {
      // Value is config object, so merge
      config = _objectSpread({}, config, bindings.value);
    } // If argument, assume element ID of container element


    if (bindings.arg) {
      // Element ID specified as arg
      // We must prepend '#' to become a CSS selector
      config.container = "#".concat(bindings.arg);
    } // Process modifiers


    keys(bindings.modifiers).forEach(function (mod) {
      if (/^html$/.test(mod)) {
        // Title allows HTML
        config.html = true;
      } else if (/^nofade$/.test(mod)) {
        // No animation
        config.animation = false;
      } else if (/^(auto|top(left|right)?|bottom(left|right)?|left(top|bottom)?|right(top|bottom)?)$/.test(mod)) {
        // Placement of tooltip
        config.placement = mod;
      } else if (/^(window|viewport)$/.test(mod)) {
        // Boundary of tooltip
        config.boundary = mod;
      } else if (/^d\d+$/.test(mod)) {
        // Delay value
        var delay = parseInt(mod.slice(1), 10) || 0;

        if (delay) {
          config.delay = delay;
        }
      } else if (/^o-?\d+$/.test(mod)) {
        // Offset value, negative allowed
        var offset = parseInt(mod.slice(1), 10) || 0;

        if (offset) {
          config.offset = offset;
        }
      }
    }); // Special handling of event trigger modifiers trigger is
    // a space separated list

    var selectedTriggers = {}; // Parse current config object trigger

    var triggers = isString(config.trigger) ? config.trigger.trim().split(/\s+/) : [];
    triggers.forEach(function (trigger) {
      if (validTriggers$1[trigger]) {
        selectedTriggers[trigger] = true;
      }
    }); // Parse modifiers for triggers

    keys(validTriggers$1).forEach(function (trigger) {
      if (bindings.modifiers[trigger]) {
        selectedTriggers[trigger] = true;
      }
    }); // Sanitize triggers

    config.trigger = keys(selectedTriggers).join(' ');

    if (config.trigger === 'blur') {
      // Blur by itself is useless, so convert it to 'focus'
      config.trigger = 'focus';
    }

    if (!config.trigger) {
      // Remove trigger config
      delete config.trigger;
    }

    return config;
  }; // Add or update ToolTip on our element


  var applyTooltip = function applyTooltip(el, bindings, vnode) {
    if (!isBrowser) {
      /* istanbul ignore next */
      return;
    }

    if (!Popper) {
      // Popper is required for ToolTips to work

      /* istanbul ignore next */
      warn('v-b-tooltip: Popper.js is required for ToolTips to work');
      /* istanbul ignore next */

      return;
    }

    var config = parseBindings$1(bindings);

    if (el[BV_TOOLTIP]) {
      el[BV_TOOLTIP].updateConfig(config);
    } else {
      el[BV_TOOLTIP] = new ToolTip(el, config, vnode.context.$root);
    }
  }; // Remove ToolTip on our element


  var removeTooltip = function removeTooltip(el) {
    if (el[BV_TOOLTIP]) {
      el[BV_TOOLTIP].destroy();
      el[BV_TOOLTIP] = null;
      delete el[BV_TOOLTIP];
    }
  };
  /*
   * Export our directive
   */


  var BTooltipDirective = {
    bind: function bind(el, bindings, vnode) {
      applyTooltip(el, bindings, vnode);
    },
    inserted: function inserted(el, bindings, vnode) {
      applyTooltip(el, bindings, vnode);
    },
    update: function update(el, bindings, vnode)
    /* istanbul ignore next: not easy to test */
    {
      if (bindings.value !== bindings.oldValue) {
        applyTooltip(el, bindings, vnode);
      }
    },
    componentUpdated: function componentUpdated(el, bindings, vnode)
    /* istanbul ignore next: not easy to test */
    {
      if (bindings.value !== bindings.oldValue) {
        applyTooltip(el, bindings, vnode);
      }
    },
    unbind: function unbind(el) {
      removeTooltip(el);
    }
  };

  var components$B = {
    BTooltip: BTooltip
  };
  var directives$3 = {
    BTooltip: BTooltipDirective
  };
  var index$y = {
    install: installFactory({
      components: components$B,
      directives: directives$3
    })
  };



  var componentPlugins = /*#__PURE__*/Object.freeze({
    Alert: index,
    Badge: index$1,
    Breadcrumb: index$2,
    Button: index$3,
    ButtonToolbar: index$5,
    ButtonGroup: index$4,
    Card: index$7,
    Carousel: index$8,
    Collapse: CollapsePlugin,
    Dropdown: DropdownPlugin,
    Embed: index$a,
    Form: index$b,
    FormGroup: index$c,
    FormInput: index$f,
    FormTextarea: index$g,
    FormFile: index$h,
    FormCheckbox: index$d,
    FormRadio: index$e,
    FormSelect: index$i,
    Image: index$j,
    InputGroup: index$6,
    Jumbotron: index$k,
    Layout: index$9,
    Link: index$l,
    ListGroup: index$m,
    Media: index$n,
    Modal: index$o,
    Nav: NavPlugin,
    Navbar: index$p,
    Pagination: index$q,
    PaginationNav: index$r,
    Popover: index$s,
    Progress: index$t,
    Spinner: index$u,
    Table: index$v,
    Tabs: index$w,
    Toast: index$x,
    Tooltip: index$y
  });

  var directives$4 = {
    BToggle: BToggleDirective
  };
  var index$z = {
    install: installFactory({
      directives: directives$4
    })
  };

  var directives$5 = {
    BModal: BModalDirective
  };
  var index$A = {
    install: installFactory({
      directives: directives$5
    })
  };

  /*
   * Constants / Defaults
   */

  var NAME$i = 'v-b-scrollspy';
  var ACTIVATE_EVENT = 'bv::scrollspy::activate';
  var Default = {
    element: 'body',
    offset: 10,
    method: 'auto',
    throttle: 75
  };
  var DefaultType = {
    element: '(string|element|component)',
    offset: 'number',
    method: 'string',
    throttle: 'number'
  };
  var ClassName$2 = {
    DROPDOWN_ITEM: 'dropdown-item',
    ACTIVE: 'active'
  };
  var Selector$4 = {
    ACTIVE: '.active',
    NAV_LIST_GROUP: '.nav, .list-group',
    NAV_LINKS: '.nav-link',
    NAV_ITEMS: '.nav-item',
    LIST_ITEMS: '.list-group-item',
    DROPDOWN: '.dropdown, .dropup',
    DROPDOWN_ITEMS: '.dropdown-item',
    DROPDOWN_TOGGLE: '.dropdown-toggle'
  };
  var OffsetMethod = {
    OFFSET: 'offset',
    POSITION: 'position' // HREFs must end with a hash followed by at least one non-hash character.
    // HREFs in the links are assumed to point to non-external links.
    // Comparison to the current page base URL is not performed!

  };
  var HREF_REGEX = /^.*(#[^#]+)$/; // Transition Events

  var TransitionEndEvents$2 = ['webkitTransitionEnd', 'transitionend', 'otransitionend', 'oTransitionEnd']; // Options for events

  var EventOptions$3 = {
    passive: true,
    capture: false
    /*
     * Utility Methods
     */
    // Better var type detection

  };

  function toType$1(obj)
  /* istanbul ignore next: not easy to test */
  {
    return {}.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  } // Check config properties for expected types


  function typeCheckConfig(componentName, config, configTypes)
  /* istanbul ignore next: not easy to test */
  {
    for (var property in configTypes) {
      if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
        var expectedTypes = configTypes[property];
        var value = config[property];
        var valueType = value && isElement(value) ? 'element' : toType$1(value); // handle Vue instances

        valueType = value && value._isVue ? 'component' : valueType;

        if (!new RegExp(expectedTypes).test(valueType)) {
          /* istanbul ignore next */
          warn("".concat(componentName, ": Option \"").concat(property, "\" provided type \"").concat(valueType, "\" but expected type \"").concat(expectedTypes, "\""));
        }
      }
    }
  }
  /*
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  /* istanbul ignore next: not easy to test */


  var ScrollSpy
  /* istanbul ignore next: not easy to test */
  =
  /*#__PURE__*/
  function () {
    function ScrollSpy(element, config, $root) {
      _classCallCheck(this, ScrollSpy);

      // The element we activate links in
      this.$el = element;
      this.$scroller = null;
      this.$selector = [Selector$4.NAV_LINKS, Selector$4.LIST_ITEMS, Selector$4.DROPDOWN_ITEMS].join(',');
      this.$offsets = [];
      this.$targets = [];
      this.$activeTarget = null;
      this.$scrollHeight = 0;
      this.$resizeTimeout = null;
      this.$obs_scroller = null;
      this.$obs_targets = null;
      this.$root = $root || null;
      this.$config = null;
      this.updateConfig(config);
    }

    _createClass(ScrollSpy, [{
      key: "updateConfig",
      value: function updateConfig(config, $root) {
        if (this.$scroller) {
          // Just in case out scroll element has changed
          this.unlisten();
          this.$scroller = null;
        }

        var cfg = _objectSpread({}, this.constructor.Default, config);

        if ($root) {
          this.$root = $root;
        }

        typeCheckConfig(this.constructor.Name, cfg, this.constructor.DefaultType);
        this.$config = cfg;

        if (this.$root) {
          var self = this;
          this.$root.$nextTick(function () {
            self.listen();
          });
        } else {
          this.listen();
        }
      }
    }, {
      key: "dispose",
      value: function dispose() {
        this.unlisten();
        clearTimeout(this.$resizeTimeout);
        this.$resizeTimeout = null;
        this.$el = null;
        this.$config = null;
        this.$scroller = null;
        this.$selector = null;
        this.$offsets = null;
        this.$targets = null;
        this.$activeTarget = null;
        this.$scrollHeight = null;
      }
    }, {
      key: "listen",
      value: function listen() {
        var _this = this;

        var scroller = this.getScroller();

        if (scroller && scroller.tagName !== 'BODY') {
          eventOn(scroller, 'scroll', this, EventOptions$3);
        }

        eventOn(window, 'scroll', this, EventOptions$3);
        eventOn(window, 'resize', this, EventOptions$3);
        eventOn(window, 'orientationchange', this, EventOptions$3);
        TransitionEndEvents$2.forEach(function (evtName) {
          eventOn(window, evtName, _this, EventOptions$3);
        });
        this.setObservers(true); // Schedule a refresh

        this.handleEvent('refresh');
      }
    }, {
      key: "unlisten",
      value: function unlisten() {
        var _this2 = this;

        var scroller = this.getScroller();
        this.setObservers(false);

        if (scroller && scroller.tagName !== 'BODY') {
          eventOff(scroller, 'scroll', this, EventOptions$3);
        }

        eventOff(window, 'scroll', this, EventOptions$3);
        eventOff(window, 'resize', this, EventOptions$3);
        eventOff(window, 'orientationchange', this, EventOptions$3);
        TransitionEndEvents$2.forEach(function (evtName) {
          eventOff(window, evtName, _this2, EventOptions$3);
        });
      }
    }, {
      key: "setObservers",
      value: function setObservers(on) {
        var _this3 = this;

        // We observe both the scroller for content changes, and the target links
        if (this.$obs_scroller) {
          this.$obs_scroller.disconnect();
          this.$obs_scroller = null;
        }

        if (this.$obs_targets) {
          this.$obs_targets.disconnect();
          this.$obs_targets = null;
        }

        if (on) {
          this.$obs_targets = observeDom(this.$el, function () {
            _this3.handleEvent('mutation');
          }, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['href']
          });
          this.$obs_scroller = observeDom(this.getScroller(), function () {
            _this3.handleEvent('mutation');
          }, {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['id', 'style', 'class']
          });
        }
      } // general event handler

    }, {
      key: "handleEvent",
      value: function handleEvent(evt) {
        var type = isString(evt) ? evt : evt.type;
        var self = this;

        function resizeThrottle() {
          if (!self.$resizeTimeout) {
            self.$resizeTimeout = setTimeout(function () {
              self.refresh();
              self.process();
              self.$resizeTimeout = null;
            }, self.$config.throttle);
          }
        }

        if (type === 'scroll') {
          if (!this.$obs_scroller) {
            // Just in case we are added to the DOM before the scroll target is
            // We re-instantiate our listeners, just in case
            this.listen();
          }

          this.process();
        } else if (/(resize|orientationchange|mutation|refresh)/.test(type)) {
          // Postpone these events by throttle time
          resizeThrottle();
        }
      } // Refresh the list of target links on the element we are applied to

    }, {
      key: "refresh",
      value: function refresh() {
        var _this4 = this;

        var scroller = this.getScroller();

        if (!scroller) {
          return;
        }

        var autoMethod = scroller !== scroller.window ? OffsetMethod.POSITION : OffsetMethod.OFFSET;
        var method = this.$config.method === 'auto' ? autoMethod : this.$config.method;
        var methodFn = method === OffsetMethod.POSITION ? position : offset;
        var offsetBase = method === OffsetMethod.POSITION ? this.getScrollTop() : 0;
        this.$offsets = [];
        this.$targets = [];
        this.$scrollHeight = this.getScrollHeight(); // Find all the unique link HREFs that we will control

        selectAll(this.$selector, this.$el) // Get HREF value
        .map(function (link) {
          return getAttr(link, 'href');
        }) // Filter out HREFs that do not match our RegExp
        .filter(function (href) {
          return href && HREF_REGEX.test(href || '');
        }) // Find all elements with ID that match HREF hash
        .map(function (href) {
          // Convert HREF into an ID (including # at beginning)
          var id = href.replace(HREF_REGEX, '$1').trim();

          if (!id) {
            return null;
          } // Find the element with the ID specified by id


          var el = select(id, scroller);

          if (el && isVisible(el)) {
            return {
              offset: parseInt(methodFn(el).top, 10) + offsetBase,
              target: id
            };
          }

          return null;
        }).filter(Boolean) // Sort them by their offsets (smallest first)
        .sort(function (a, b) {
          return a.offset - b.offset;
        }) // record only unique targets/offsets
        .reduce(function (memo, item) {
          if (!memo[item.target]) {
            _this4.$offsets.push(item.offset);

            _this4.$targets.push(item.target);

            memo[item.target] = true;
          }

          return memo;
        }, {}); // Return this for easy chaining

        return this;
      } // Handle activating/clearing

    }, {
      key: "process",
      value: function process() {
        var scrollTop = this.getScrollTop() + this.$config.offset;
        var scrollHeight = this.getScrollHeight();
        var maxScroll = this.$config.offset + scrollHeight - this.getOffsetHeight();

        if (this.$scrollHeight !== scrollHeight) {
          this.refresh();
        }

        if (scrollTop >= maxScroll) {
          var target = this.$targets[this.$targets.length - 1];

          if (this.$activeTarget !== target) {
            this.activate(target);
          }

          return;
        }

        if (this.$activeTarget && scrollTop < this.$offsets[0] && this.$offsets[0] > 0) {
          this.$activeTarget = null;
          this.clear();
          return;
        }

        for (var i = this.$offsets.length; i--;) {
          var isActiveTarget = this.$activeTarget !== this.$targets[i] && scrollTop >= this.$offsets[i] && (isUndefined(this.$offsets[i + 1]) || scrollTop < this.$offsets[i + 1]);

          if (isActiveTarget) {
            this.activate(this.$targets[i]);
          }
        }
      }
    }, {
      key: "getScroller",
      value: function getScroller() {
        if (this.$scroller) {
          return this.$scroller;
        }

        var scroller = this.$config.element;

        if (!scroller) {
          return null;
        } else if (isElement(scroller.$el)) {
          scroller = scroller.$el;
        } else if (isString(scroller)) {
          scroller = select(scroller);
        }

        if (!scroller) {
          return null;
        }

        this.$scroller = scroller.tagName === 'BODY' ? window : scroller;
        return this.$scroller;
      }
    }, {
      key: "getScrollTop",
      value: function getScrollTop() {
        var scroller = this.getScroller();
        return scroller === window ? scroller.pageYOffset : scroller.scrollTop;
      }
    }, {
      key: "getScrollHeight",
      value: function getScrollHeight() {
        return this.getScroller().scrollHeight || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      }
    }, {
      key: "getOffsetHeight",
      value: function getOffsetHeight() {
        var scroller = this.getScroller();
        return scroller === window ? window.innerHeight : getBCR(scroller).height;
      }
    }, {
      key: "activate",
      value: function activate(target) {
        var _this5 = this;

        this.$activeTarget = target;
        this.clear(); // Grab the list of target links (<a href="{$target}">)

        var links = selectAll(this.$selector // Split out the base selectors
        .split(',') // Map to a selector that matches links with HREF ending in the ID (including '#')
        .map(function (selector) {
          return "".concat(selector, "[href$=\"").concat(target, "\"]");
        }) // Join back into a single selector string
        .join(','), this.$el);
        links.forEach(function (link) {
          if (hasClass(link, ClassName$2.DROPDOWN_ITEM)) {
            // This is a dropdown item, so find the .dropdown-toggle and set it's state
            var dropdown = closest(Selector$4.DROPDOWN, link);

            if (dropdown) {
              _this5.setActiveState(select(Selector$4.DROPDOWN_TOGGLE, dropdown), true);
            } // Also set this link's state


            _this5.setActiveState(link, true);
          } else {
            // Set triggered link as active
            _this5.setActiveState(link, true);

            if (matches(link.parentElement, Selector$4.NAV_ITEMS)) {
              // Handle nav-link inside nav-item, and set nav-item active
              _this5.setActiveState(link.parentElement, true);
            } // Set triggered links parents as active
            // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor


            var el = link;

            while (el) {
              el = closest(Selector$4.NAV_LIST_GROUP, el);
              var sibling = el ? el.previousElementSibling : null;

              if (sibling && matches(sibling, "".concat(Selector$4.NAV_LINKS, ", ").concat(Selector$4.LIST_ITEMS))) {
                _this5.setActiveState(sibling, true);
              } // Handle special case where nav-link is inside a nav-item


              if (sibling && matches(sibling, Selector$4.NAV_ITEMS)) {
                _this5.setActiveState(select(Selector$4.NAV_LINKS, sibling), true); // Add active state to nav-item as well


                _this5.setActiveState(sibling, true);
              }
            }
          }
        }); // Signal event to via $root, passing ID of activated target and reference to array of links

        if (links && links.length > 0 && this.$root) {
          this.$root.$emit(ACTIVATE_EVENT, target, links);
        }
      }
    }, {
      key: "clear",
      value: function clear() {
        var _this6 = this;

        selectAll("".concat(this.$selector, ", ").concat(Selector$4.NAV_ITEMS), this.$el).filter(function (el) {
          return hasClass(el, ClassName$2.ACTIVE);
        }).forEach(function (el) {
          return _this6.setActiveState(el, false);
        });
      }
    }, {
      key: "setActiveState",
      value: function setActiveState(el, active) {
        if (!el) {
          return;
        }

        if (active) {
          addClass(el, ClassName$2.ACTIVE);
        } else {
          removeClass(el, ClassName$2.ACTIVE);
        }
      }
    }], [{
      key: "Name",
      get: function get() {
        return NAME$i;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType;
      }
    }]);

    return ScrollSpy;
  }();

  var BV_SCROLLSPY = '__BV_ScrollSpy__'; // Build a ScrollSpy config based on bindings (if any)
  // Arguments and modifiers take precedence over passed value config object

  /* istanbul ignore next: not easy to test */

  var parseBindings$2 = function parseBindings(bindings)
  /* istanbul ignore next: not easy to test */
  {
    var config = {}; // If argument, assume element ID

    if (bindings.arg) {
      // Element ID specified as arg
      // We must prepend '#' to become a CSS selector
      config.element = "#".concat(bindings.arg);
    } // Process modifiers


    keys(bindings.modifiers).forEach(function (mod) {
      if (/^\d+$/.test(mod)) {
        // Offset value
        config.offset = parseInt(mod, 10);
      } else if (/^(auto|position|offset)$/.test(mod)) {
        // Offset method
        config.method = mod;
      }
    }); // Process value

    if (isString(bindings.value)) {
      // Value is a CSS ID or selector
      config.element = bindings.value;
    } else if (isNumber(bindings.value)) {
      // Value is offset
      config.offset = Math.round(bindings.value);
    } else if (isObject(bindings.value)) {
      // Value is config object
      // Filter the object based on our supported config options
      keys(bindings.value).filter(function (k) {
        return Boolean(ScrollSpy.DefaultType[k]);
      }).forEach(function (k) {
        config[k] = bindings.value[k];
      });
    }

    return config;
  }; // Add or update ScrollSpy on our element


  var applyScrollspy = function applyScrollspy(el, bindings, vnode)
  /* istanbul ignore next: not easy to test */
  {
    if (!isBrowser) {
      /* istanbul ignore next */
      return;
    }

    var config = parseBindings$2(bindings);

    if (el[BV_SCROLLSPY]) {
      el[BV_SCROLLSPY].updateConfig(config, vnode.context.$root);
    } else {
      el[BV_SCROLLSPY] = new ScrollSpy(el, config, vnode.context.$root);
    }
  }; // Remove ScrollSpy on our element

  /* istanbul ignore next: not easy to test */


  var removeScrollspy = function removeScrollspy(el)
  /* istanbul ignore next: not easy to test */
  {
    if (el[BV_SCROLLSPY]) {
      el[BV_SCROLLSPY].dispose();
      el[BV_SCROLLSPY] = null;
      delete el[BV_SCROLLSPY];
    }
  };
  /*
   * Export our directive
   */


  var BScrollspyDirective = {
    bind: function bind(el, bindings, vnode)
    /* istanbul ignore next: not easy to test */
    {
      applyScrollspy(el, bindings, vnode);
    },
    inserted: function inserted(el, bindings, vnode)
    /* istanbul ignore next: not easy to test */
    {
      applyScrollspy(el, bindings, vnode);
    },
    update: function update(el, bindings, vnode)
    /* istanbul ignore next: not easy to test */
    {
      if (bindings.value !== bindings.oldValue) {
        applyScrollspy(el, bindings, vnode);
      }
    },
    componentUpdated: function componentUpdated(el, bindings, vnode)
    /* istanbul ignore next: not easy to test */
    {
      if (bindings.value !== bindings.oldValue) {
        applyScrollspy(el, bindings, vnode);
      }
    },
    unbind: function unbind(el)
    /* istanbul ignore next: not easy to test */
    {
      removeScrollspy(el);
    }
  };

  var directives$6 = {
    BScrollspy: BScrollspyDirective
  };
  var index$B = {
    install: installFactory({
      directives: directives$6
    })
  };

  var directives$7 = {
    BTooltip: BTooltipDirective
  };
  var index$C = {
    install: installFactory({
      directives: directives$7
    })
  };

  var directives$8 = {
    BPopover: BPopoverDirective
  };
  var index$D = {
    install: installFactory({
      directives: directives$8
    })
  };



  var directivePlugins = /*#__PURE__*/Object.freeze({
    Toggle: index$z,
    Modal: index$A,
    Scrollspy: index$B,
    Tooltip: index$C,
    Popover: index$D
  });

  var install$2 = function install(Vue) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (install.installed) {
      /* istanbul ignore next */
      return;
    }

    install.installed = true; // Configure BootstrapVue

    setConfig(config); // Register component plugins

    registerPlugins(Vue, componentPlugins); // Register directive plugins

    registerPlugins(Vue, directivePlugins);
  };

  install$2.installed = false;
  var BootstrapVue = {
    install: install$2,
    setConfig: setConfig // Auto installation only occurs if window.Vue exists

  };
  vueUse(BootstrapVue);

  return BootstrapVue;

}));
//# sourceMappingURL=bootstrap-vue.js.map
