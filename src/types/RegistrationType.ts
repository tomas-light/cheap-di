import { AbstractConstructor } from './AbstractConstructor';
import { Constructor } from './Constructor';

export type RegistrationType<TInstance> = Constructor<TInstance> | AbstractConstructor<TInstance>;
