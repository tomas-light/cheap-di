import { Bar } from 'package1';

export class Foo {
  constructor(readonly bar: Bar) {}

  do() {
    return 'foo resolved in esm mode: ' + this.bar.get('succeed');
  }
}
