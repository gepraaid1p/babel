import callDelegate from "../../helpers/call-delegate";
import * as util from  "../../../util";
import traverse from  "../../../traversal";
import * as t from "../../../types";

var hasDefaults = function (node) {
  for (var i = 0; i < node.params.length; i++) {
    if (!t.isIdentifier(node.params[i])) return true;
  }
  return false;
};

var iifeVisitor = {
  ReferencedIdentifier(node, parent, scope, state) {
    if (!state.scope.hasOwnBinding(node.name)) return;
    if (state.scope.bindingIdentifierEquals(node.name, node)) return;

    state.iife = true;
    this.stop();
  }
};

exports.Function = function (node, parent, scope, file) {
  if (!hasDefaults(node)) return;

  t.ensureBlock(node);

  var body = [];

  var argsIdentifier = t.identifier("arguments");
  argsIdentifier._shadowedFunctionLiteral = true;

  var lastNonDefaultParam = 0;

  var state = { iife: false, scope: scope };

  var pushDefNode = function (left, right, i) {
    var defNode = util.template("default-parameter", {
      VARIABLE_NAME: left,
      DEFAULT_VALUE: right,
      ARGUMENT_KEY:  t.literal(i),
      ARGUMENTS:     argsIdentifier
    }, true);
    defNode._blockHoist = node.params.length - i;
    body.push(defNode);
  };

  var params = this.get("params");
  for (var i = 0; i < params.length; i++) {
    var param = params[i];

    if (!param.isAssignmentPattern()) {
      if (!param.isRestElement()) {
        lastNonDefaultParam = i + 1;
      }

      if (!param.isIdentifier()) {
        param.traverse(iifeVisitor, state);
      }

      if (file.transformers["es6.spec.blockScoping"].canTransform() && param.isIdentifier()) {
        pushDefNode(param.node, t.identifier("undefined"), i);
      }

      continue;
    }

    var left  = param.get("left");
    var right = param.get("right");

    var placeholder = scope.generateUidIdentifier("x");
    placeholder._isDefaultPlaceholder = true;
    node.params[i] = placeholder;

    if (!state.iife) {
      if (right.isIdentifier() && scope.hasOwnBinding(right.node.name)) {
        state.iife = true;
      } else {
        right.traverse(iifeVisitor, state);
      }
    }

    pushDefNode(left.node, right.node, i);
  }

  // we need to cut off all trailing default parameters
  node.params = node.params.slice(0, lastNonDefaultParam);

  if (state.iife) {
    body.push(callDelegate(node, scope));
    node.body = t.blockStatement(body);
  } else {
    node.body.body = body.concat(node.body.body);
  }
};
