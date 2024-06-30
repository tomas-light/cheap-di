type TraceType = {
  type: string;
  implemented: string;
};

class Trace {
  trace: Trace | null;
  implemented: string;

  constructor(public readonly type: string) {
    this.trace = null;
    this.implemented = type;
  }

  addTrace(type: string) {
    this.trace = new Trace(type);
  }

  build(): string {
    if (!this.trace) {
      return '';
    }

    const traces = this.getTrace();
    const implementations = traces.map((trace) => trace.implemented);

    let firstLoopIndex = -1;
    const loopImplementation = implementations.find((impl) => {
      firstLoopIndex = implementations.indexOf(impl);
      const lastIndex = implementations.lastIndexOf(impl);
      return firstLoopIndex != lastIndex;
    });

    if (!loopImplementation) {
      console.log('something goes wrong with loop search');
      return '';
    }

    const copy = [...implementations];
    copy.splice(firstLoopIndex, 1);
    const secondLoopIndex = copy.indexOf(loopImplementation) + 1;

    const loop = traces.slice(firstLoopIndex, secondLoopIndex + 1);
    const trace = loop
      .map((types) => `(${types.type}, ${types.implemented})`)
      .join(' -> ');
    return trace;
  }

  private getTrace(): TraceType[] {
    const _type: TraceType = {
      type: this.type,
      implemented: this.implemented,
    };

    if (!this.trace) {
      return [_type];
    }

    const nestedTrace = this.trace.getTrace();
    return [_type, ...nestedTrace];
  }
}

export { Trace };
