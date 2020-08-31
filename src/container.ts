import { Constructor } from "./interfaces/constructor";
import { ConstructorParams } from "./interfaces/constructor-params";
import { RegisteredType } from "./interfaces/registered-type";

const dependencies = new Map<InstanceType<any>, RegisteredType>();

function makeInstance(instanceType: InstanceType<any>, args: any[]) {
    const implementation = dependencies.get(instanceType);
    if (typeof implementation !== "function") {
        return implementation;
    }

    const injectionParams = implementation.__injectionParams || [];
    return new implementation(...[
        ...injectionParams,
        ...args,
    ]);
}

const container = {
    registerType: function (implementationType: InstanceType<RegisteredType>) {
        return {
            as: (type: any) => {
                if (dependencies.has(type)) {
                    throw new Error(`The instance type (${type.name}) is already registered`);
                }
                dependencies.set(type, implementationType);

                return {
                    with: (...injectionParams: any[]) => {
                        implementationType.__injectionParams = injectionParams;
                    },
                };
            },
        };
    },

    registerInstance: function (instance: any) {
        return {
            as: (type: any) => {
                if (dependencies.has(type)) {
                    throw new Error(`The instance type (${type.name}) is already registered`);
                }
                dependencies.set(type, instance);
            },
        };
    },

    resolve: function <TType extends Constructor & Partial<ConstructorParams> = any>(type: TType, ...args: any[]): InstanceType<TType> {
        if (dependencies.has(type)) {
            return makeInstance(type, args);
        }

        if (!type.__constructorParams || !Array.isArray(type.__constructorParams)) {
            throw new Error(`The ${type.name} cannot be resolved by Dependency Injection`);
        }

        const dependencyArguments: any[] = [];
        type.__constructorParams.forEach((type: InstanceType<any>) => {
            const instance = container.resolve(type);
            dependencyArguments.push(instance);
        });

        return new type(...[
            ...dependencyArguments,
            ...args,
        ]);
    },
};

export { container };
