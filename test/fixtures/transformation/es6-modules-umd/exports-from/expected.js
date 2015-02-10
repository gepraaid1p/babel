(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "foo"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("foo"));
  }
})(function (exports, _foo) {
  "use strict";

  var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

  var _defaults = function (obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var key in keys) { if (obj[key] === undefined) { Object.defineProperty(obj, key, Object.getOwnPropertyDescriptor(defaults, key)); } } return obj; };

  _defaults(exports, _interopRequireWildcard(_foo));

  exports.foo = _foo.foo;
  exports.foo = _foo.foo;
  exports.bar = _foo.bar;
  exports.bar = _foo.foo;
  exports["default"] = _foo.foo;
  exports["default"] = _foo.foo;
  exports.bar = _foo.bar;
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
});