import { memoize } from "./Functions";

export class Container {

  #context: any = {};
  #containers: Set<Container> = new Set();
  #dependencies = new Map<string, any>();

  readonly dependencies = new Proxy({}, {
    get: (target, property: string) => {
      return this.resolve(property);
    },

    ownKeys: () => {
      const keys = new Set(Reflect.ownKeys(this.#context));

      this.#containers.forEach(container => {
        Reflect.ownKeys(container.#context).forEach(key => {
          return keys.add(key);
        });
      });

      return Array.from(keys);
    },

    getOwnPropertyDescriptor: (target, property) => {
      if (this.#context.hasOwnProperty(property)) {
        return {
          enumerable: true,
          configurable: true,
        };
      }

      for (const container of this.#containers) {
        if (container.#context.hasOwnProperty(property)) {
          return {
            enumerable: true,
            configurable: true,
          };
        }
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

  with(container: Container) {
    if (container !== this && ! this.#containers.has(container)) {
      this.#containers.add(container);
    }

    return this;
  }

  invalidate() {
    for (const [ , dependency ] of this.#dependencies) {
      if ( ! dependency.persistent) {
        dependency.provide.invalidate();
      }
    }

    return this;
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
    this.#dependencies.set(name, {
      persistent: persistent || false,
      provide: memoize((context) => provide(context))
    });
  }

  has(name: string) {
    if (this.#dependencies.has(name)) {
      return true;
    }

    if (this.#context.hasOwnProperty(name)) {
      return true;
    }

    return false;
  }

  resolve(name: string) {
    if (this.#dependencies.has(name)) {
      const dependency = this.#dependencies.get(name);
      return dependency.provide(this.dependencies);
    }

    if (this.#context.hasOwnProperty(name)) {
      return this.#context[name];
    }

    for (const container of this.#containers) {
      if (container.has(name)) {
        return container.resolve(name);
      }
    }

    return undefined;
  }
}
