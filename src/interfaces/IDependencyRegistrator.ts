import { RegisteredType } from "./registered-type";

export interface IDependencyRegistrator {
    registerType: (implementationType: InstanceType<RegisteredType>) => {
        as: (type: any) => {
            with: (...injectionParams: any[]) => void;
        };
    };

    registerInstance: (instance: any) => {
        as: (type: any) => void;
    };
}
