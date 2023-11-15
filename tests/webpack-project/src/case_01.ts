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
//
// import { container } from '@cheap-di/lib';
//
// const repoInstance1 = new Repository1();
// repoInstance1.props = 'repo 1 string';
// container.registerInstance(repoInstance1);
//
// const service1 = container.resolve(Service1);
// service1?.repository.props;
