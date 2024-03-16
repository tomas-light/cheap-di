import DefaultExported, { Bar } from 'package1';
import cheapDi from 'cheap-di';

class Foo {
  constructor(
    readonly bar: Bar,
    readonly defaultExport: DefaultExported
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
}
