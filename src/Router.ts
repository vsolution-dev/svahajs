import { Route } from "./Route";
import { Container } from "./Container";
import { compose, Middleware, Dispatcher } from "./Middleware";

export abstract class Router {

  static wrap(router: Router): Middleware {
    return (container: Container, context: any, next?: Dispatcher) => {
      return router.handle(container, next);
    }
  }

  readonly routes: Route[] = [];
  readonly middleware: Middleware[] = [];

  use(middleware: Middleware) {
    this.middleware.push(middleware);
    return this;
  }

  route(route: any, middleware: Middleware) {
    this.routes.push(new Route(route, [ middleware ]));
    return this;
  }

  abstract match(context: any): Route[];

  handle(container: Container, done?: Dispatcher) {
    const routes = this.match(container.dependencies);
    if ( ! routes.length) {
      return done();
    }

    const middleware = compose(this.middleware);
    return middleware(container, (container: Container, context: any) => {
      const middleware = compose(routes.map((route): Middleware => {
        return (container, context: any, next) => {
          return route.handle(container, next);
        }
      }));

      return middleware(container, () => {
        return done();
      });
    });
  }
}
