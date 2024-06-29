import { Dependency } from "./Dependency";

export class Container {

  #context: any = {};
  #dependencies = new Map<string, Dependency>();

  public constructor(context = {}) {
    this.for(context);
  }

  public for(context: any) {
    this.#context = context;
    return this;
  }

  public clear() {
    for (const [ name, dependency ] of this.#dependencies) {
      if ( ! dependency.persistent) {
        this.#dependencies.delete(name);
      }
    }
  }

  public unbind(name: string) {
    this.#dependencies.delete(name);
    return this;
  }

  public bind(name: any, handle?: any, persistent: boolean = false) {
    let dependency = name;
    if (typeof name === 'string') {
      dependency = { name, handle, persistent };
    }

    this.set(dependency);
    return this;
  }

  private set({ name, handle, persistent }) {
    this.#dependencies.set(name, new Dependency(handle, persistent));
  }

  public get dependencies() {
    return new Proxy({}, {
      get: (target, name: string) => {
        return this.resolve(name);
      },

      ownKeys: () => {
        return Object.keys(this.#context);
      },

      getOwnPropertyDescriptor: (target, name: string) => {
        if (this.#context.hasOwnProperty(name)) {
          return {
            enumerable: true,
            configurable: true,
          };
        }
      },
    });
  }

  public resolve(name: string) {
    if (this.#dependencies.has(name)) {
      const dependency = this.#dependencies.get(name);
      return dependency.resolve(this.dependencies);
    }

    if (this.#context.hasOwnProperty(name)) {
      return this.#context[name];
    }

    return undefined;
  }
}
