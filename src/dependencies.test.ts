import { dependencies } from './dependencies';
import { dependenciesSymbol as dependencies_s } from './symbols';
import { ImplementationType } from './types';

test('case 1', () => {
  class Service1 {
    get() {
    }
  }
  class Service2 {
    get2() {
    }
  }

  @dependencies(Service1, Service2)
  class MyClass {
    constructor(private service: Service1, private service2: Service2) {
    }
  }

  expect((MyClass as ImplementationType<MyClass>)[dependencies_s]).toEqual([Service1, Service2]);
});

test('class name preserving', () => {
  class Service1 {
    get() {
    }
  }

  @dependencies(Service1)
  class MyClass {
    constructor(private service: Service1) {
    }
  }

  expect((MyClass as any).className).toBe('MyClass');
});

test('static members', () => {
  class Service1 {
    get() {
    }
  }

  const text = 'static do';

  @dependencies(Service1)
  class MyClass {
    static do() {
      return text;
    }

    constructor(private service: Service1) {
    }
  }

  expect((MyClass as ImplementationType<MyClass>)[dependencies_s]).toEqual([Service1]);
  expect(MyClass.do()).toBe(text);
});

test('check types: injection params allowing', () => {
  abstract class AService {
    abstract do1(m: string): void;
  }
  abstract class BService {
    abstract do2(m: string): void;
  }

  class AServiceImpl extends AService {
    do1(m: string) {}
  }

  class BServiceImpl extends BService {
    do2(m: string) {}
  }

  @dependencies(AService)
  class Consumer1 {
    constructor(service: AService) {
    }
  }

  @dependencies(AService, BService)
  class Consumer2 {
    constructor(service1: AService, service2: BService) {
    }
  }

  @dependencies(AService)
  class Consumer3 {
    constructor(service1: AService, service2: BService) {
    }
  }

  expect((Consumer1 as ImplementationType<Consumer1>)[dependencies_s]).toEqual([AService]);
  expect((Consumer2 as ImplementationType<Consumer2>)[dependencies_s]).toEqual([AService, BService]);
  expect((Consumer3 as ImplementationType<Consumer3>)[dependencies_s]).toEqual([AService]);
});
