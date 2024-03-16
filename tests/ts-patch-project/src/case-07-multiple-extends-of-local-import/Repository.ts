import { Logger } from './Logger';

export class Repository {
  constructor(private logger: Logger) {}

  users() {
    const users = ['user-1', 'user-2'];
    this.logger.log(users.join(', '));
    return users;
  }
}
