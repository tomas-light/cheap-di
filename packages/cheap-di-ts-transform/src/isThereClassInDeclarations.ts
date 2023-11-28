import ts from 'typescript';

export function isThereClassInDeclarations(symbolDeclarations?: ts.Declaration[]) {
  if (!symbolDeclarations) {
    return false;
  }

  let classDeclaration: ts.ClassDeclaration | undefined;

  for (const declaration of symbolDeclarations) {
    if (ts.isClassDeclaration(declaration)) {
      classDeclaration = declaration;
      break;
    }
  }

  return classDeclaration;
}
