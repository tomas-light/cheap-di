import { AbstractConstructor } from './AbstractConstructor';
import { Constructor } from './Constructor';

export type ImplementationType<TInstance> =
  Constructor<TInstance>
  & {
    __dependencies?: (Constructor | AbstractConstructor)[]
  }
;
