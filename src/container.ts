import { Constructor } from "./interfaces/constructor";
import { ConstructorParams } from "./interfaces/constructor-params";
import { RegisteredType } from "./interfaces/registered-type";

const dependencies = new Map<InstanceType<any>, RegisteredType>();

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
        let implementation: TType | RegisteredType = type;
        if (dependencies.has(type)) {
            implementation = dependencies.get(type) as RegisteredType;
        }

        if (typeof implementation !== 'function') {
            return implementation as InstanceType<TType>;
        }

        const dependencyArguments: any[] = [];
        if (implementation.__constructorParams) {
            implementation.__constructorParams.forEach((type: InstanceType<any>) => {
                const instance = container.resolve(type);
                dependencyArguments.push(instance);
            });
        }

        const injectionParams = (implementation as RegisteredType).__injectionParams || [];

        return new implementation(...[
            ...dependencyArguments,
            ...injectionParams,
            ...args,
        ]);
    },
};

export { container };
