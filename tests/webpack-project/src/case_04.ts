import cheapDi from 'cheap-di';

class Instance1 {
  constructor(public key = 'instance 1 key') {}
}

class A {}

export default class B extends A {
  constructor(public instance: Instance1) {
    super();
  }

  log() {
    console.log('succeed: ', this.instance.key);
  }
}

const bClass = cheapDi.container.resolve(B);
if (!bClass) {
  console.log('no B class');
} else {
  bClass.log();
}
