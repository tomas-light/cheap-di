import { Bar } from 'package1';
import cheapDi from 'cheap-di';

class Foo {
  constructor(readonly bar: Bar) {}

  do() {
    console.log('my class does ...');
    this.bar.logInfo();
  }
}

const myClass = cheapDi.container.resolve(Foo);
if (!myClass) {
  console.log('no my class');
} else {
  myClass.do();
}
