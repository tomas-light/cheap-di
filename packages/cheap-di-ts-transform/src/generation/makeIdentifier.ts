import ts from 'typescript';

export function makeIdentifier(nameOrIdentifier: string | ts.Identifier) {
  let identifier: ts.Identifier;
  if (typeof nameOrIdentifier === 'string') {
    identifier = ts.factory.createIdentifier(nameOrIdentifier);
  } else {
    identifier = nameOrIdentifier;
  }
  return identifier;
}
