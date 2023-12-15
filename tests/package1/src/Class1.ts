import { Service1 } from './Service1.js';

export class Class1 {
  constructor(readonly service: Service1) {}

  logInfo() {
    this.service.log('succeed');
  }
}
