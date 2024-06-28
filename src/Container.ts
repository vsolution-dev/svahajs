export class Container {

  readonly #dependencies = new Map<string, any>();

  constructor(
    private readonly context: any
  ) {
  }

  has(name: string) {
    return this.#dependencies.has(name);
  }

  get(name: string) {
    return this.#dependencies.get(name);
  }

  register(name: string, dependency: any) {
    this.#dependencies.set(name, dependency);
    return this;
  }

  get dependencies() {
    return new Proxy({}, {
      get: (target, name: string) => {
        if (this.has(name)) {
          return this.resolve(name);
        }

        if (this.context.hasOwnProperty(name)) {
          return this.context[name];
        }

        throw new Error(`의존성(${name})을 찾을 수 없습니다.`);
      }
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
