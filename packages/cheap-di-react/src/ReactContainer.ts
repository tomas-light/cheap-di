import {
  AbstractConstructor,
  Constructor,
  ContainerImpl,
  ImplementationType,
} from 'cheap-di';

export class ReactContainer extends ContainerImpl {
  rerender: () => void;
  private scope: 'local' | 'global';
  skipParentInstanceOnce: boolean;

  constructor(public parentContainer?: ContainerImpl) {
    super();
    this.rerender = () => undefined;
    this.scope = 'global';
    this.skipParentInstanceOnce = false;
  }

  get rootContainer() {
    return this.findRootContainer();
  }
  get rootReactContainer() {
    return this.findReactContainerContainer();
  }

  sameParent(parentContainer?: ContainerImpl) {
    return this.parentContainer === parentContainer;
  }

  getDependencies() {
    return this.dependencies;
  }

  localScope<Callback extends (container: ReactContainer) => any>(
    callback: Callback
  ): Callback extends (container: ReactContainer) => infer Result
    ? Result
    : void {
    this.scope = 'local';
    const result = callback(this);
    this.scope = 'global';

    return result;
  }

  skipParentInstanceResolvingOnce() {
    this.skipParentInstanceOnce = true;
  }

  getInstance<TInstance>(
    type: Constructor<TInstance> | AbstractConstructor<TInstance>
  ): ImplementationType<TInstance> | object | undefined {
    if (this.instances.has(type)) {
      return this.instances.get(type)!;
    }

    if (this.parentContainer && this.scope === 'global') {
      if (this.skipParentInstanceOnce) {
        this.skipParentInstanceOnce = false;
        return undefined;
      }

      return this.parentContainer.getInstance(type);
    }

    return undefined;
  }

  getImplementation<TInstance>(
    type: Constructor<TInstance> | AbstractConstructor<TInstance>
  ): ImplementationType<TInstance> | object | undefined {
    if (this.dependencies.has(type)) {
      return this.dependencies.get(type)!;
    }

    if (this.parentContainer && this.scope === 'global') {
      return this.parentContainer.getImplementation(type);
    }

    return undefined;
  }

  getEnrichCallback<TInstance>(
    type: Constructor<TInstance> | AbstractConstructor<TInstance>
  ): ((instance: any) => any) | undefined {
    if (this.enrichCallbacks.has(type)) {
      return this.enrichCallbacks.get(type)!;
    }

    if (this.parentContainer && this.scope === 'global') {
      return this.parentContainer.getEnrichCallback(type);
    }

    return undefined;
  }

  getSingletons() {
    const rootContainer = this.findRootContainer();
    return rootContainer.singletons;
  }

  private findRootContainer(): ContainerImpl {
    if (this.parentContainer) {
      if (this.parentContainer instanceof ReactContainer) {
        return this.parentContainer.findRootContainer();
      }
      return this.parentContainer;
    }

    return this;
  }

  private findReactContainerContainer(): ReactContainer {
    if (this.parentContainer instanceof ReactContainer) {
      return this.parentContainer.findReactContainerContainer();
    }

    return this;
  }
}
