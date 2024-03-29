import { useContext } from 'react';
import { AbstractConstructor, Constructor } from 'cheap-di';
import { DiContext } from '../DiContext.js';

export function use<TInstance>(
  type: Constructor<TInstance> | AbstractConstructor<TInstance>,
  ...args: any[]
): TInstance {
  const context = useContext(DiContext);
  if (!context || !context.container) {
    throw new Error('Container not found. You should use Provider as one of parent nodes of this component');
  }

  const implementation = context.container.resolve(type, ...args);
  if (!implementation) {
    throw new Error(`Type (${type}) is not registered in cheap-di-react`);
  }

  return implementation;
}

export { use as useDi };
