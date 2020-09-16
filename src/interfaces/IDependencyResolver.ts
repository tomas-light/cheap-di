import { Constructor } from "./constructor";
import { ConstructorParams } from "./constructor-params";

export interface IDependencyResolver {
    resolve: <TType extends Constructor & Partial<ConstructorParams> = any>(type: TType, ...args: any[]) => InstanceType<TType>;
}
