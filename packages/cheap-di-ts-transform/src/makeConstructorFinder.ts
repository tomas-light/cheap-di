import ts from 'typescript';
import { ClassConstructorParameter } from './ClassConstructorParameter.js';

export function makeConstructorFinder(context: ts.TransformationContext, typeChecker: ts.TypeChecker) {
  const ref = {
    classLocalName: undefined as string | undefined,
    parameters: [] as ClassConstructorParameter[],
  };

  function constructorFinder(classNode: ts.Node): ts.Node {
    if (ts.isIdentifier(classNode)) {
      if (!ref.classLocalName) {
        const identifierSymbol = typeChecker.getSymbolAtLocation(classNode);
        ref.classLocalName = identifierSymbol?.escapedName.toString();
      }
      return classNode;
    }

    if (!ts.isConstructorDeclaration(classNode)) {
      return ts.visitEachChild(classNode, constructorFinder, context);
    }

    const constructorDeclaration: ts.ConstructorDeclaration = classNode;

    const parameterDeclarations: ts.ParameterDeclaration[] = [];
    constructorDeclaration.forEachChild((node) => {
      if (ts.isParameter(node)) {
        parameterDeclarations.push(node);
      }
    });

    for (const parameterDeclaration of parameterDeclarations) {
      const parameter: ClassConstructorParameter = {
        type: 'unknown',
      };
      ref.parameters.push(parameter);

      parameterDeclaration.forEachChild((parameterNode) => {
        if (parameterNode.kind !== ts.SyntaxKind.TypeReference) {
          return;
        }

        let identifierSymbol: ts.Symbol | undefined;
        for (const nodeChild of parameterNode.getChildren()) {
          if (ts.isIdentifier(nodeChild)) {
            identifierSymbol = typeChecker.getSymbolAtLocation(nodeChild);
            break;
          }
        }

        if (!identifierSymbol) {
          return;
        }

        const symbolDeclarations = identifierSymbol.getDeclarations();
        if (!symbolDeclarations?.length) {
          return;
        }

        let isClass = false;
        let parameterClassDeclaration: ts.ClassDeclaration | undefined;

        for (const declaration of symbolDeclarations) {
          if (ts.isClassDeclaration(declaration)) {
            isClass = true;
            parameterClassDeclaration = declaration;
            break;
          }
        }

        if (isClass) {
          parameter.type = 'class';
          parameter.classReferenceLocalName = identifierSymbol.escapedName.toString();
        }
      });
    }

    return constructorDeclaration;
  }

  return {
    ref,
    constructorFinder,
  };
}
