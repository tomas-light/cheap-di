import { Constructor } from './Constructor';
import { ConstructorParams } from './ConstructorParams';

export interface DependencyResolver {
  resolve: <TType extends Constructor & Partial<ConstructorParams> = any>(type: TType, ...args: any[]) => InstanceType<TType>;
}
