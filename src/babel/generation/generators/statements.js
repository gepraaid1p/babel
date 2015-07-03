import repeating from "repeating";
import * as t from "../../types";

/**
 * [Please add a description.]
 */

export function WithStatement(node, print) {
  this.keyword("with");
  this.push("(");
  print.plain(node.object);
  this.push(")");
  print.block(node.body);
}

/**
 * [Please add a description.]
 */

export function IfStatement(node, print) {
  this.keyword("if");
  this.push("(");
  print.plain(node.test);
  this.push(")");
  this.space();

  print.indentOnComments(node.consequent);

  if (node.alternate) {
    if (this.isLast("}")) this.space();
    this.push("else ");
    print.indentOnComments(node.alternate);
  }
}

/**
 * [Please add a description.]
 */

export function ForStatement(node, print) {
  this.keyword("for");
  this.push("(");

  print.plain(node.init);
  this.push(";");

  if (node.test) {
    this.space();
    print.plain(node.test);
  }
  this.push(";");

  if (node.update) {
    this.space();
    print.plain(node.update);
  }

  this.push(")");
  print.block(node.body);
}

/**
 * [Please add a description.]
 */

export function WhileStatement(node, print) {
  this.keyword("while");
  this.push("(");
  print.plain(node.test);
  this.push(")");
  print.block(node.body);
}

/**
 * [Please add a description.]
 */

var buildForXStatement = function (op) {
  return function (node, print) {
    this.keyword("for");
    this.push("(");
    print.plain(node.left);
    this.push(` ${op} `);
    print.plain(node.right);
    this.push(")");
    print.block(node.body);
  };
};

/**
 * [Please add a description.]
 */

export var ForInStatement = buildForXStatement("in");
export var ForOfStatement = buildForXStatement("of");

/**
 * [Please add a description.]
 */

export function DoWhileStatement(node, print) {
  this.push("do ");
  print.plain(node.body);
  this.space();
  this.keyword("while");
  this.push("(");
  print.plain(node.test);
  this.push(");");
}

/**
 * [Please add a description.]
 */

var buildLabelStatement = function (prefix, key) {
  return function (node, print) {
    this.push(prefix);

    var label = node[key || "label"];
    if (label) {
      this.push(" ");
      print.plain(label);
    }

    this.semicolon();
  };
};

/**
 * [Please add a description.]
 */

export var ContinueStatement = buildLabelStatement("continue");
export var ReturnStatement   = buildLabelStatement("return", "argument");
export var BreakStatement    = buildLabelStatement("break");

/**
 * [Please add a description.]
 */

export function LabeledStatement(node, print) {
  print.plain(node.label);
  this.push(": ");
  print.plain(node.body);
}

/**
 * [Please add a description.]
 */

export function TryStatement(node, print) {
  this.keyword("try");
  print.plain(node.block);
  this.space();

  // Esprima bug puts the catch clause in a `handlers` array.
  // see https://code.google.com/p/esprima/issues/detail?id=433
  // We run into this from regenerator generated ast.
  if (node.handlers) {
    print.plain(node.handlers[0]);
  } else {
    print.plain(node.handler);
  }

  if (node.finalizer) {
    this.space();
    this.push("finally ");
    print.plain(node.finalizer);
  }
}

/**
 * [Please add a description.]
 */

export function CatchClause(node, print) {
  this.keyword("catch");
  this.push("(");
  print.plain(node.param);
  this.push(") ");
  print.plain(node.body);
}

/**
 * [Please add a description.]
 */

export function ThrowStatement(node, print) {
  this.push("throw ");
  print.plain(node.argument);
  this.semicolon();
}

/**
 * [Please add a description.]
 */

export function SwitchStatement(node, print) {
  this.keyword("switch");
  this.push("(");
  print.plain(node.discriminant);
  this.push(")");
  this.space();
  this.push("{");

  print.sequence(node.cases, {
    indent: true,
    addNewlines(leading, cas) {
      if (!leading && node.cases[node.cases.length - 1] === cas) return -1;
    }
  });

  this.push("}");
}

/**
 * [Please add a description.]
 */

export function SwitchCase(node, print) {
  if (node.test) {
    this.push("case ");
    print.plain(node.test);
    this.push(":");
  } else {
    this.push("default:");
  }

  if (node.consequent.length) {
    this.newline();
    print.sequence(node.consequent, { indent: true });
  }
}

/**
 * [Please add a description.]
 */

export function DebuggerStatement() {
  this.push("debugger;");
}

/**
 * [Please add a description.]
 */

export function VariableDeclaration(node, print, parent) {
  this.push(node.kind + " ");

  var hasInits = false;
  // don't add whitespace to loop heads
  if (!t.isFor(parent)) {
    for (var declar of (node.declarations: Array)) {
      if (declar.init) {
        // has an init so let's split it up over multiple lines
        hasInits = true;
      }
    }
  }

  //
  // use a pretty separator when we aren't in compact mode, have initializers and don't have retainLines on
  // this will format declarations like:
  //
  //   var foo = "bar", bar = "foo";
  //
  // into
  //
  //   var foo = "bar",
  //       bar = "foo";
  //

  var sep;
  if (!this.format.compact && !this.format.concise && hasInits && !this.format.retainLines) {
    sep = `,\n${repeating(" ", node.kind.length + 1)}`;
  }

  //

  print.list(node.declarations, { separator: sep });

  if (t.isFor(parent)) {
    // don't give semicolons to these nodes since they'll be inserted in the parent generator
    if (parent.left === node || parent.init === node) return;
  }

  this.semicolon();
}

/**
 * [Please add a description.]
 */

export function VariableDeclarator(node, print) {
  print.plain(node.id);
  print.plain(node.id.typeAnnotation);
  if (node.init) {
    this.space();
    this.push("=");
    this.space();
    print.plain(node.init);
  }
}
