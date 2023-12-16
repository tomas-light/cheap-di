import ts from 'typescript';

export function constVariableDeclaration(binding: ts.BindingName, initializer?: ts.Expression | undefined) {
  return ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [ts.factory.createVariableDeclaration(binding, undefined, undefined, initializer)],
      ts.NodeFlags.Const
    )
  );
}
