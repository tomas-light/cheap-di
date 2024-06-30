import DefaultExported, { Bar } from 'package1';
import cheapDi from 'cheap-di';
import { LocalFoo } from './LocalFoo';

class Foo {
  constructor(
    readonly bar: Bar,
    readonly defaultExport: DefaultExported,
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

class Zoo {
  constructor(
    readonly bar: Bar,
    readonly defaultExport: DefaultExported,
    readonly localFoo: LocalFoo
  ) {}

  do() {
    console.log('Zoo does ...');
    this.bar.log('succeed');
  }
}

const zoo = cheapDi.container.resolve(Zoo);
if (!zoo) {
  console.log('no Zoo');
} else {
  zoo.do();
  zoo.defaultExport.log();
  zoo.localFoo.bar();
}

class Goo {
  constructor(
    readonly bar: Bar,
    readonly defaultExport: DefaultExported,
    readonly localFoo: LocalFoo
  ) {}

  do() {
    console.log('Goo does ...');
    this.bar.log('succeed');
  }
}

const goo = cheapDi.container.resolve(Goo);
if (!goo) {
  console.log('no Goo');
} else {
  goo.do();
  goo.defaultExport.log();
  goo.localFoo.bar();
}
