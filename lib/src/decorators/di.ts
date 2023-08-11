import 'reflect-metadata';
import { Constructor } from '../types';
import { inject } from './inject';

const primitiveConstructors = [
  Object,
  Boolean,
  String,
  Number,
  Date,
];

function di<TClass extends Constructor>(constructor: TClass): TClass {
  const paramTypes = Reflect.getMetadata('design:paramtypes', constructor) as any[]

  if (!Array.isArray(paramTypes)) {
    if (constructor.prototype) {
      return di(constructor.prototype);
    }

    return constructor;
  }

  paramTypes.forEach((type, index) => {
    if (type instanceof Object && !primitiveConstructors.includes(type)) {
      inject(type)(constructor, type.name, index);
    }
  });

  return constructor;
}

export { di };
