export class TestClass {
  props?: string;
}

export class Abc {
  props?: string;
}

export class MyTest {
  constructor(
    localString: string,
    private test: TestClass,
    passedObject: { age: number },
    abc?: Abc
  ) {}

  log() {
    console.log(this.test.props);
  }
}
