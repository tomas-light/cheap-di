import { ImplementationType } from './ImplementationType';

export type ImplementationTypeWithInjection<TInstance> =
  ImplementationType<TInstance>
  & {
    __injectionParams?: any[];
  }
;
