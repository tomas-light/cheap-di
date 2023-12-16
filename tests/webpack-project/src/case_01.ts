class Repository1 {
  props?: string;
}

class Instance1 {
  constructor(public key = 'instance 1 key') {}
}

class Service1 {
  constructor(
    localString: string,
    public repository: Repository1,
    passedObject: { age: number },
    instance1?: Instance1
  ) {}
}
class Service2 {
  constructor(
    localString: string,
    public repository: Repository1,
    passedObject: { age: number },
    instance1?: Instance1
  ) {}
}
