import DefaultExported from 'package1';
import cheapDi from 'cheap-di';

class Foo {
  constructor(readonly defaultExport: DefaultExported) {}
}

const foo = cheapDi.container.resolve(Foo);
if (!foo) {
  console.log('no Foo');
} else {
  foo.defaultExport.log();
}
