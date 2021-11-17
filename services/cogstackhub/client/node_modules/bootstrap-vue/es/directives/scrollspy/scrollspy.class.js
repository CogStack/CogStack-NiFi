"use strict";

exports.__esModule = true;
exports.default = void 0;

var _observeDom = _interopRequireDefault(require("../../utils/observe-dom"));

var _warn = _interopRequireDefault(require("../../utils/warn"));

var _dom = require("../../utils/dom");

var _inspect = require("../../utils/inspect");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
 * Constants / Defaults
 */
var NAME = 'v-b-scrollspy';
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
var ClassName = {
  DROPDOWN_ITEM: 'dropdown-item',
  ACTIVE: 'active'
};
var Selector = {
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

var TransitionEndEvents = ['webkitTransitionEnd', 'transitionend', 'otransitionend', 'oTransitionEnd']; // Options for events

var EventOptions = {
  passive: true,
  capture: false
  /*
   * Utility Methods
   */
  // Better var type detection

};

function toType(obj)
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
      var valueType = value && (0, _dom.isElement)(value) ? 'element' : toType(value); // handle Vue instances

      valueType = value && value._isVue ? 'component' : valueType;

      if (!new RegExp(expectedTypes).test(valueType)) {
        /* istanbul ignore next */
        (0, _warn.default)("".concat(componentName, ": Option \"").concat(property, "\" provided type \"").concat(valueType, "\" but expected type \"").concat(expectedTypes, "\""));
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
    this.$selector = [Selector.NAV_LINKS, Selector.LIST_ITEMS, Selector.DROPDOWN_ITEMS].join(',');
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
        (0, _dom.eventOn)(scroller, 'scroll', this, EventOptions);
      }

      (0, _dom.eventOn)(window, 'scroll', this, EventOptions);
      (0, _dom.eventOn)(window, 'resize', this, EventOptions);
      (0, _dom.eventOn)(window, 'orientationchange', this, EventOptions);
      TransitionEndEvents.forEach(function (evtName) {
        (0, _dom.eventOn)(window, evtName, _this, EventOptions);
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
        (0, _dom.eventOff)(scroller, 'scroll', this, EventOptions);
      }

      (0, _dom.eventOff)(window, 'scroll', this, EventOptions);
      (0, _dom.eventOff)(window, 'resize', this, EventOptions);
      (0, _dom.eventOff)(window, 'orientationchange', this, EventOptions);
      TransitionEndEvents.forEach(function (evtName) {
        (0, _dom.eventOff)(window, evtName, _this2, EventOptions);
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
        this.$obs_targets = (0, _observeDom.default)(this.$el, function () {
          _this3.handleEvent('mutation');
        }, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ['href']
        });
        this.$obs_scroller = (0, _observeDom.default)(this.getScroller(), function () {
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
      var type = (0, _inspect.isString)(evt) ? evt : evt.type;
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
      var methodFn = method === OffsetMethod.POSITION ? _dom.position : _dom.offset;
      var offsetBase = method === OffsetMethod.POSITION ? this.getScrollTop() : 0;
      this.$offsets = [];
      this.$targets = [];
      this.$scrollHeight = this.getScrollHeight(); // Find all the unique link HREFs that we will control

      (0, _dom.selectAll)(this.$selector, this.$el) // Get HREF value
      .map(function (link) {
        return (0, _dom.getAttr)(link, 'href');
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


        var el = (0, _dom.select)(id, scroller);

        if (el && (0, _dom.isVisible)(el)) {
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
        var isActiveTarget = this.$activeTarget !== this.$targets[i] && scrollTop >= this.$offsets[i] && ((0, _inspect.isUndefined)(this.$offsets[i + 1]) || scrollTop < this.$offsets[i + 1]);

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
      } else if ((0, _dom.isElement)(scroller.$el)) {
        scroller = scroller.$el;
      } else if ((0, _inspect.isString)(scroller)) {
        scroller = (0, _dom.select)(scroller);
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
      return scroller === window ? window.innerHeight : (0, _dom.getBCR)(scroller).height;
    }
  }, {
    key: "activate",
    value: function activate(target) {
      var _this5 = this;

      this.$activeTarget = target;
      this.clear(); // Grab the list of target links (<a href="{$target}">)

      var links = (0, _dom.selectAll)(this.$selector // Split out the base selectors
      .split(',') // Map to a selector that matches links with HREF ending in the ID (including '#')
      .map(function (selector) {
        return "".concat(selector, "[href$=\"").concat(target, "\"]");
      }) // Join back into a single selector string
      .join(','), this.$el);
      links.forEach(function (link) {
        if ((0, _dom.hasClass)(link, ClassName.DROPDOWN_ITEM)) {
          // This is a dropdown item, so find the .dropdown-toggle and set it's state
          var dropdown = (0, _dom.closest)(Selector.DROPDOWN, link);

          if (dropdown) {
            _this5.setActiveState((0, _dom.select)(Selector.DROPDOWN_TOGGLE, dropdown), true);
          } // Also set this link's state


          _this5.setActiveState(link, true);
        } else {
          // Set triggered link as active
          _this5.setActiveState(link, true);

          if ((0, _dom.matches)(link.parentElement, Selector.NAV_ITEMS)) {
            // Handle nav-link inside nav-item, and set nav-item active
            _this5.setActiveState(link.parentElement, true);
          } // Set triggered links parents as active
          // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor


          var el = link;

          while (el) {
            el = (0, _dom.closest)(Selector.NAV_LIST_GROUP, el);
            var sibling = el ? el.previousElementSibling : null;

            if (sibling && (0, _dom.matches)(sibling, "".concat(Selector.NAV_LINKS, ", ").concat(Selector.LIST_ITEMS))) {
              _this5.setActiveState(sibling, true);
            } // Handle special case where nav-link is inside a nav-item


            if (sibling && (0, _dom.matches)(sibling, Selector.NAV_ITEMS)) {
              _this5.setActiveState((0, _dom.select)(Selector.NAV_LINKS, sibling), true); // Add active state to nav-item as well


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

      (0, _dom.selectAll)("".concat(this.$selector, ", ").concat(Selector.NAV_ITEMS), this.$el).filter(function (el) {
        return (0, _dom.hasClass)(el, ClassName.ACTIVE);
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
        (0, _dom.addClass)(el, ClassName.ACTIVE);
      } else {
        (0, _dom.removeClass)(el, ClassName.ACTIVE);
      }
    }
  }], [{
    key: "Name",
    get: function get() {
      return NAME;
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

var _default = ScrollSpy;
exports.default = _default;