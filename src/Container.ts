export class Container {

  readonly #dependencies = new Map<string, any>();

  constructor(
    private readonly context: any
  ) {
  }

  has(name: string) {
    if (this.#dependencies.has(name)) {
      return true;
    }

    if (this.context.hasOwnProperty(name)) {
      return true;
    }

    return false;
  }

  get(name: string) {
    if (this.#dependencies.has(name)) {
      return this.#dependencies.get(name);
    }

    if (this.context.hasOwnProperty(name)) {
      return this.context[name];
    }

    return undefined;
  }

  register(name: string, dependency?: any) {
    this.#dependencies.set(name, dependency);
    return this;
  }

  get dependencies() {
    return new Proxy({}, {
      get: (target, name: string) => {
        if (this.has(name)) {
          return this.resolve(name);
        }

        return undefined;
        // throw new Error(`의존성(${name})을 찾을 수 없습니다.`);
      },

      ownKeys: () => {
        return Object.keys(this.context);
      },

      getOwnPropertyDescriptor: (target, name: string) => {
        if (this.context.hasOwnProperty(name)) {
          return {
            enumerable: true,
            configurable: true,
          };
        }
      },
    });
  }

  resolve(name: string) {
    if ( ! this.has(name)) {
      throw new Error(`의존성(${name})을 찾을 수 없습니다.`);
    }

    const dependency = this.get(name);
    if (typeof dependency === 'function') {
      return dependency(this.dependencies);
    }

    return dependency;
  }
}
