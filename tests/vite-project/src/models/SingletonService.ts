export class SingletonService {
  #token = 'initial token';

  get token() {
    return this.#token;
  }

  set token(value) {
    this.#token = value;
  }
}
