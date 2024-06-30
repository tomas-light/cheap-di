import { ImportType } from './findImports.js';
import ts from 'typescript';

export type ClassConstructorParameter = UnknownParameter | PrimitiveParameter | ClassParameter;

export interface UnknownParameter {
  type: 'unknown';
  name?: string | undefined;
  importedId?: ts.Identifier;
}

export type PrimitiveType =
  | 'number'
  | 'boolean'
  | 'string'
  | 'undefined'
  | 'symbol'
  | 'bigint'
  | 'any'
  | 'unknown'
  | 'function'
  | 'null';

export interface PrimitiveParameter {
  type: 'primitive';
  name?: string | undefined;
  primitiveTypes: PrimitiveType[];
}

export interface ClassParameter {
  type: 'class';
  name?: string | undefined;
  importedClass?: ImportedEntity | ExistedImport;
}

export function isClassParameter(parameter: ClassConstructorParameter): parameter is ClassParameter {
  return parameter.type === 'class';
}

export function isPrimitiveParameter(parameter: ClassConstructorParameter): parameter is PrimitiveParameter {
  return parameter.type === 'primitive';
}

export interface ExistedImport {
  existedId: ts.Identifier;
}

export function isExistedImport(importedClass: ImportedEntity | ExistedImport): importedClass is ExistedImport {
  return (importedClass as ExistedImport).existedId != null;
}

export interface ImportedEntity {
  /**
   * @example
   * import { MyClass as Some } from "./myClass"; // => id of "Some"
   * import { MyClass } from "./myClass"; // => undefined
   * import Some from "./myClass"; // => undefined
   * */
  namedAsId: ts.Identifier | undefined;

  /**
   * @example
   * import { MyClass as Some } from "./myClass"; // => id of "MyClass"
   * import Some from "./myClass"; // => id of "MyClass"
   * */
  id: ts.Identifier;

  /**
   * @example
   * import { ... } from "react"; // => "react"
   * import { ... } from "../local/module"; // => "../local/module"
   * */
  importedFrom: string;

  /**
   * @example
   * import { ... } from "react"; // => "named"
   * import react from "react"; // => "default"
   * */
  importType: ImportType;
}
