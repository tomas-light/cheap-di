import { ImportType } from './findImports.js';

export type ClassConstructorParameter = UnknownParameter | ClassParameter;

export interface UnknownParameter {
  type: 'unknown';
}

export interface ClassParameter {
  type: 'class';
  classReference?: LocalClass | ImportedClass;
}
export function isClassParameter(parameter: UnknownParameter | ClassParameter): parameter is ClassParameter {
  return parameter.type === 'class';
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
}
export function isImportedClass(classReference: LocalClass | ImportedClass): classReference is ImportedClass {
  return (
    ('classNameInImport' satisfies keyof ImportedClass) in classReference ||
    ('importedFrom' satisfies keyof ImportedClass) in classReference
  );
}
