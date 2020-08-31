export interface RegisteredInstanceType {
    new(...parameters: any[]): any;

    __constructorParams: InstanceType<any>[];
    __injectionParams: any[];
}
