import { Container } from "./Container";
import { compose, Dispatcher, Middleware } from "./Middleware";

export class Route {
  constructor(
    readonly route: any,
    readonly middleware: Middleware[],
  ) {
  }

  handle(container: Container, done?: Dispatcher) {
    const middleware = compose(this.middleware);
    return middleware(container, (container: Container, context: any, next) => {
      return done();
    });
  }
}
