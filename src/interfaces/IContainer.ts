import { IDependencyRegistrator } from "./IDependencyRegistrator";
import { IDependencyResolver } from "./IDependencyResolver";

export interface IContainer extends IDependencyRegistrator, IDependencyResolver {
}
