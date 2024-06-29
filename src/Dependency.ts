export class Dependency {

  private value: any;

  constructor(
    private readonly handle: any,
    public readonly persistent: boolean = false,
  ) {
  }

  resolve(dependencies) {
    if (this.value) {
      return this.value;
    }

    let value = this.handle;
    if (typeof this.handle === 'function') {
      value = this.handle(dependencies);
    }

    this.value = value;
    return value;
  }
}
