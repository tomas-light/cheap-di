import { AbstractConstructor } from './AbstractConstructor';
import { Constructor } from './Constructor';

export interface DependencyResolver {
  resolve: <TInstance>(type: Constructor<TInstance> | AbstractConstructor<TInstance>, ...args: any[]) => TInstance | undefined;
}
