import { Logger } from './Logger';
import { Repository } from './Repository';

export class Service3 {
  constructor(
    private repository: Repository,
    private logger: Logger
  ) {}

  data() {
    this.logger.log('service-3');
    return this.repository.users();
  }
}
