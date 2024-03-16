import * as package1 from 'package1';
import cheapDi from 'cheap-di';
import { LocalFoo } from './LocalFoo';

class Foo {
  constructor(
    readonly bar: package1.Bar,
    readonly defaultExport: package1.default,
    readonly localFoo: LocalFoo
  ) {}

  do() {
    console.log('Foo does ...');
    this.bar.log('succeed');
  }
}

const foo = cheapDi.container.resolve(Foo);
if (!foo) {
  console.log('no Foo');
} else {
  foo.do();
  foo.defaultExport.log();
  foo.localFoo.bar();
}
