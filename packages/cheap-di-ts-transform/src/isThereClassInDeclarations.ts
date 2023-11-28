import ts from 'typescript';

export function isThereClassInDeclarations(symbolDeclarations?: ts.Declaration[]) {
  if (!symbolDeclarations) {
    return false;
  }

  let isClass = false;

  for (const declaration of symbolDeclarations) {
    if (ts.isClassDeclaration(declaration)) {
      isClass = true;
      break;
    }
  }

  return isClass;
}
