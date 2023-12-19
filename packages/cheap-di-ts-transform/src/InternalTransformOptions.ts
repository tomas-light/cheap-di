import { TransformOptions } from './TransformOptions.js';
import ts from 'typescript';

export type InternalTransformOptions = TransformOptions & {
  // registeredClasses: Set<ts.Identifier>;
};
