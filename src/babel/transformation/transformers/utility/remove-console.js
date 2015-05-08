import * as t from "../../../types";

export var metadata = {
  optional: true,
  category: "builtin-setup"
};

export function CallExpression(node, parent) {
  if (this.get("callee").matchesPattern("console", true)) {
    if (t.isExpressionStatement(parent)) {
      this.parentPath.remove();
    } else {
      this.remove();
    }
  }
}
