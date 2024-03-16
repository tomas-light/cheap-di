import { Logger } from './Logger';

export class Service2 {
  constructor(private logger: Logger) {}

  data() {
    this.logger.log('service-2');
    return 'service-2';
  }
}
