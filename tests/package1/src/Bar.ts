import { Zoo } from './Zoo.js';

export class Bar {
  constructor(readonly service: Zoo) {}

  logInfo() {
    this.service.log('succeed');
  }
  get() {
    return this.service.get('succeed');
  }
}
