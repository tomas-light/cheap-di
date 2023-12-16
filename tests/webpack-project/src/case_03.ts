import { Class1 } from 'package1';
import cheapDi from 'cheap-di';

class MyClass {
  constructor(readonly _class1: Class1) {}

  do() {
    console.log('my class does ...');
    this._class1.logInfo();
  }
}

const myClass = cheapDi.container.resolve(MyClass);
if (!myClass) {
  console.log('no my class');
} else {
  myClass.do();
}
