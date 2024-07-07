type ProvideFunction<T> = (context: any, container?: Container) => T;
type InvalidateFunction = (context?: any, container?: Container) => void;

export interface Dependency<T> {
  name: string;
  provide: ProvideFunction<T>;
  invalidate?: InvalidateFunction;
}

type Context = Record<string, any>;
type Dependencies = Record<string, Dependency<any>>;

export class Container {

  _context: Context = {};
  _containers: Set<Container> = new Set();
  _dependencies: Dependencies = {};

  readonly dependencies = new Proxy({}, {
    get: (target, property: string) => {
      return this.resolve(property);
    },

    ownKeys: () => {
      const keys = new Set(Reflect.ownKeys(this._context));

      this._containers.forEach(container => {
        Reflect.ownKeys(container._context).forEach(key => {
          return keys.add(key);
        });
      });

      return Array.from(keys);
    },

    getOwnPropertyDescriptor: (target, property) => {
      if (this._context.hasOwnProperty(property)) {
        return {
          enumerable: true,
          configurable: true,
        };
      }

      for (const container of this._containers) {
        if (container._context.hasOwnProperty(property)) {
          return {
            enumerable: true,
            configurable: true,
          };
        }
      }
    },
  });

  for(context: Context) {
    this._context = context;
    return this;
  }

  with(container: Container) {
    this._containers.add(container);
    container._containers.add(this);

    return this;
  }

  invalidate() {
    Object.entries(this._dependencies).forEach(([ , dependency ]) => {
      if (typeof dependency.invalidate === 'function') {
        dependency.invalidate();
      }
    })

    return this;
  }

  unbind(name: string) {
    delete this._dependencies[name];
    return this;
  }

  bind(name: any, provide?: any, invalidate?: any) {
    let dependency = name;
    if (typeof name === 'string') {
      dependency = { name, provide, invalidate };
    }

    this.#addDependency(dependency);
    return this;
  }

  #addDependency({ name, provide, invalidate }) {
    this._dependencies[name] = {
      name: name,
      provide: provide,
      invalidate: invalidate,
    };
  }

  has(name: string) {
    if (this._dependencies.hasOwnProperty(name)) {
      return true;
    }

    if (this._context.hasOwnProperty(name)) {
      return true;
    }

    return false;
  }

  resolve(name: string) {
    if (this._dependencies.hasOwnProperty(name)) {
      const dependency = this._dependencies[name];
      return dependency.provide(this.dependencies, this);
    }

    if (this._context.hasOwnProperty(name)) {
      return this._context[name];
    }

    for (const container of this._containers) {
      if (container.has(name)) {
        return container.resolve(name);
      }
    }

    return undefined;
  }
}
