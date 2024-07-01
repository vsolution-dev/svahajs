import { memoize } from "./Functions";

export class Container {

  #context: any = {};
  #dependencies = new Map<string, any>();

  dependencies = new Proxy({}, {
    get: (target, name: string) => {
      return this.resolve(name);
    },

    ownKeys: () => {
      return Object.keys(this.#context);
    },

    getOwnPropertyDescriptor: (target, name) => {
      if (this.#context.hasOwnProperty(name)) {
        return {
          enumerable: true,
          configurable: true,
        };
      }
    },
  });

  constructor(context = {}) {
    this.for(context);
  }

  for(context: any) {
    this.#context = context;
    return this;
  }

  clear() {
    for (const [ name, dependency ] of this.#dependencies) {
      if ( ! dependency.persistent) {
        this.unbind(name);
      }
    }
  }

  unbind(name: string) {
    this.#dependencies.delete(name);
    return this;
  }

  bind(name: any, provide?: any, persistent: boolean = false) {
    let dependency = name;
    if (typeof name === 'string') {
      dependency = { name, provide, persistent };
    }

    this.#addDependency(dependency);
    return this;
  }

  #addDependency({ name, provide, persistent }) {
    const dependency = this.#dependencies.get(name);
    if (dependency && dependency.persistent) {
      return;
    }

    this.#dependencies.set(name, {
      persistent: persistent || false,
      provide: memoize((context) => provide(context))
    });
  }

  resolve(name: string) {
    if (this.#dependencies.has(name)) {
      const dependency = this.#dependencies.get(name);
      return dependency.provide(this.dependencies);
    }

    if (this.#context.hasOwnProperty(name)) {
      return this.#context[name];
    }

    return undefined;
  }
}
