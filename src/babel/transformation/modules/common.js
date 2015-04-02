import DefaultFormatter from "./_default";
import includes from "lodash/collection/includes";
import * as util from  "../../util";
import * as t from "../../types";

export default class CommonJSFormatter extends DefaultFormatter {
  init() {
    var file  = this.file;
    var scope = file.scope;

    scope.rename("module");
    scope.rename("exports");

    if (!this.noInteropRequireImport && this.hasNonDefaultExports) {
      var templateName = "exports-module-declaration";
      if (this.file.isLoose("es6.modules")) templateName += "-loose";
      var declar = util.template(templateName, true);
      declar._blockHoist = 3;
      file.ast.program.body.unshift(declar);
    }
  }

  exportFromSepcifier() {

  }

  importSpecifier(specifier, node, nodes) {
    var variableName = specifier.local;

    var ref = this.getExternalReference(node, nodes);

    // import foo from "foo";
    if (t.isSpecifierDefault(specifier)) {
      if (!includes(this.file.dynamicImportedNoDefault, node)) {
        if (this.noInteropRequireImport || includes(this.file.dynamicImported, node)) {
          ref = t.memberExpression(ref, t.identifier("default"));
        } else {
          var uid = this.scope.generateUidIdentifier(variableName.name);
          nodes.push(t.variableDeclaration("var", [
            t.variableDeclarator(uid, t.callExpression(this.file.addHelper("interop-require"), [ref]))
          ]));
          ref = uid;
        }
      }

      this.internalRemap[variableName.name] = ref;
    } else {
      if (t.isImportNamespaceSpecifier(specifier)) {
        if (!this.noInteropRequireImport) {
          ref = t.callExpression(this.file.addHelper("interop-require-wildcard"), [ref]);
        }

        // import * as bar from "foo";
        nodes.push(t.variableDeclaration("var", [
          t.variableDeclarator(variableName, ref)
        ]));
      } else {
        // import { foo } from "foo";
        this.internalRemap[variableName.name] = t.memberExpression(ref, specifier.imported);
      }
    }
  }

  importDeclaration(node, nodes) {
    // import "foo";
    nodes.push(util.template("require", {
      MODULE_NAME: node.source
    }, true));
  }

  exportSpecifier(specifier, node, nodes) {
    if (this.doDefaultExportInterop(specifier)) {
      nodes.push(util.template("exports-default-assign", {
        VALUE: specifier.local
      }, true));
      return;
    } else {
      DefaultFormatter.prototype.exportSpecifier.apply(this, arguments);
    }
  }

  exportDeclaration(node, nodes) {
    if (this.doDefaultExportInterop(node)) {
      var declar = node.declaration;
      var assign = util.template("exports-default-assign", {
        VALUE: this._pushStatement(declar, nodes)
      }, true);

      if (t.isFunctionDeclaration(declar)) {
        // we can hoist this assignment to the top of the file
        assign._blockHoist = 3;
      }

      nodes.push(assign);
      return;
    }

    DefaultFormatter.prototype.exportDeclaration.apply(this, arguments);
  }

  _getExternalReference(node, nodes) {
    var source = node.source.value;
    var call = t.callExpression(t.identifier("require"), [node.source]);

    var uid = this.scope.generateUidBasedOnNode(node, "import");
    var declar = t.variableDeclaration("var", [
      t.variableDeclarator(uid, call)
    ]);
    nodes.push(declar);
    return uid;
  }
}
