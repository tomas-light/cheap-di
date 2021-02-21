import { Constructor } from './Constructor';
import { ConstructorParams } from './ConstructorParams';
import { InjectionParams } from './InjectionParams';

export type RegisteredType = Constructor & ConstructorParams & InjectionParams;
