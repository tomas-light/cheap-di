import ts from 'typescript';

export type TransformationGenerations = {
  getCheapDiIdentifier: () => ts.Identifier | undefined;
  addCheapDi: (cheapDiMetadata: {
    /**
     * ID to use in saveMetadata (generated ID for new node or existing one in case of reusing)
     * @example
     * cheap-di ID
     *
     * @example
     * a class to save as dependency
     * */
    identifier: ts.Identifier;

    /**
     * @example
     * import cheap_di_1 from 'cheap-di';
     * */
    generatedImportDeclaration: ts.Statement;
  }) => void;

  addImport: (generatedImport: {
    /** where is import from */
    from: string;

    /** generated nodes */
    nodes: ts.Statement[];
  }) => void;
};
