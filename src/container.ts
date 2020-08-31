import { Constructor } from "./interfaces/constructor";
import { ConstructorParams } from "./interfaces/constructor-params";
import { RegisteredInstanceType } from "./interfaces/registered-instance-type";

const dependencies = new Map<InstanceType<any>, RegisteredInstanceType>();

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
    registerType: function (implementationType: RegisteredInstanceType) {
        return {
            as: (instanceType: InstanceType<any>) => {
                if (dependencies.has(instanceType)) {
                    throw new Error(`The instance type (${instanceType.name}) is already registered`);
                }
                dependencies.set(instanceType, implementationType);

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
            as: (instanceType: InstanceType<any>) => {
                if (dependencies.has(instanceType)) {
                    throw new Error(`The instance type (${instanceType.name}) is already registered`);
                }
                dependencies.set(instanceType, instance);
            },
        };
    },

    resolve: function <TType extends Constructor & Partial<ConstructorParams> = any>(instanceType: TType, ...args: any[]): TType {
        if (dependencies.has(instanceType)) {
            return makeInstance(instanceType, args);
        }

        if (!instanceType.__constructorParams || !Array.isArray(instanceType.__constructorParams)) {
            throw new Error(`The ${instanceType.name} cannot be resolved by Dependency Injection`);
        }

        const dependencyArguments: any[] = [];
        instanceType.__constructorParams.forEach((type: InstanceType<any>) => {
            const instance = container.resolve(type);
            dependencyArguments.push(instance);
        });

        return new instanceType(...[
            ...dependencyArguments,
            ...args,
        ]);
    },
};

export { container };
