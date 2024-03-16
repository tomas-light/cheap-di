import { Repository } from './Repository';

export class Service1 {
  constructor(private repository: Repository) {}

  data() {
    return this.repository.users();
  }
}
