"use strict";

exports.__esModule = true;
exports.default = exports.unbindTargets = exports.bindTargets = void 0;

var _object = require("./object");

var _dom = require("./dom");

var allListenTypes = {
  hover: true,
  click: true,
  focus: true
};
var BVBoundListeners = '__BV_boundEventListeners__';

var bindTargets = function bindTargets(vnode, binding, listenTypes, fn) {
  var targets = (0, _object.keys)(binding.modifiers || {}).filter(function (t) {
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

  (0, _object.keys)(allListenTypes).forEach(function (type) {
    if (listenTypes[type] || binding.modifiers[type]) {
      (0, _dom.eventOn)(vnode.elm, type, listener);
      var boundListeners = vnode.elm[BVBoundListeners] || {};
      boundListeners[type] = boundListeners[type] || [];
      boundListeners[type].push(listener);
      vnode.elm[BVBoundListeners] = boundListeners;
    }
  }); // Return the list of targets

  return targets;
};

exports.bindTargets = bindTargets;

var unbindTargets = function unbindTargets(vnode, binding, listenTypes) {
  (0, _object.keys)(allListenTypes).forEach(function (type) {
    if (listenTypes[type] || binding.modifiers[type]) {
      var boundListeners = vnode.elm[BVBoundListeners] && vnode.elm[BVBoundListeners][type];

      if (boundListeners) {
        boundListeners.forEach(function (listener) {
          return (0, _dom.eventOff)(vnode.elm, type, listener);
        });
        delete vnode.elm[BVBoundListeners][type];
      }
    }
  });
};

exports.unbindTargets = unbindTargets;
var _default = bindTargets;
exports.default = _default;