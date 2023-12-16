class Some {
  get() {
    return '123';
  }
}

class Service {
  constructor(public readonly some: Some | undefined) {}
}
