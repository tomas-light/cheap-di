import { Zoo } from './Zoo.js';
import { inject } from 'cheap-di';

// it is required, because cheap-di-ts-transform deepRegistration works incorrectly,
// and will be removed in further release
// without it, any packaged dependencies should have their own dependency
// (specified by decorator, and with container settings manually)
@inject(Zoo)
export class Bar {
  constructor(readonly service: Zoo) {}

  log(message: string) {
    console.log(message);
  }
  get(message: string) {
    return message;
  }
}
