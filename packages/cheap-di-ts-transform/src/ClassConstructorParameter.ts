import { ImportType } from './findImports.js';

export type ClassConstructorParameter = UnknownParameter | PrimitiveParameter | ClassParameter;

export interface UnknownParameter {
  type: 'unknown';
  name?: string | undefined;
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
  classReference?: LocalClass | ImportedClass;
}

export function isClassParameter(parameter: ClassConstructorParameter): parameter is ClassParameter {
  return parameter.type === 'class';
}

export function isPrimitiveParameter(parameter: ClassConstructorParameter): parameter is PrimitiveParameter {
  return parameter.type === 'primitive';
}

export interface LocalClass {
  /**
   * @example
   * import { MyClass as Some } from "./myClass"; // => "Some"
   * */
  localName: string;
}

export function isLocalClass(classReference: LocalClass | ImportedClass): classReference is LocalClass {
  return ('localName' satisfies keyof LocalClass) in classReference;
}

export interface ImportedClass {
  /**
   * @example
   * import { MyClass } from "./myClass"; // => "MyClass"
   * */
  classNameInImport: string;
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

  /** if imported dependency has its own dependencies in its package we have to get them all as well */
  constructorParameters?: ClassConstructorParameter[];
}

export function isImportedClass(classReference: LocalClass | ImportedClass): classReference is ImportedClass {
  return (
    ('classNameInImport' satisfies keyof ImportedClass) in classReference ||
    ('importedFrom' satisfies keyof ImportedClass) in classReference
  );
}
