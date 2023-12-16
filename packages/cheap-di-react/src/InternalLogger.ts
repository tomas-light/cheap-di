export class InternalLogger {
  constructor(private debugName?: string) {}

  log(...messages: any[]) {
    if (this.debugName) {
      console.log.apply(null, [`Provider ${this.debugName}`, ...messages]);
    }
  }
}
