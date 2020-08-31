import { Constructor } from "./constructor";
import { ConstructorParams } from "./constructor-params";
import { InjectionParams } from "./injection-params";

export interface RegisteredType extends Constructor, ConstructorParams, InjectionParams {
}
