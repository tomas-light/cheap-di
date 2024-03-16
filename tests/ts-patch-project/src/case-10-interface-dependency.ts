import { LocalInterface } from './LocalInterface.js';

export class MyClass implements LocalInterface {
  constructor(local: LocalInterface) {
    this.name = local.name;
  }

  name: string;
}

const myClass = new MyClass({ name: '123' });
console.log('is correct:', myClass.name === '123');
