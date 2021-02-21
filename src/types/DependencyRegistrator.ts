import { RegisteredType } from './RegisteredType';

export interface DependencyRegistrator {
  registerType: (implementationType: InstanceType<RegisteredType>) => {
    as: (type: any) => {
      with: (...injectionParams: any[]) => void;
    };
  };

  registerInstance: (instance: any) => {
    as: (type: any) => void;
  };
}
