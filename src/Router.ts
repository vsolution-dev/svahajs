import { Route } from "@/Route";
import { Application } from "@/Application";
import { compose, Middleware, Dispatcher } from "@/Middleware";

export abstract class Router {

  static wrap(router: Router): Middleware {
    return (application: Application, context, next?: Dispatcher) => {
      return router.handle(application, context, next);
    }
  }

  readonly routes: Route[] = [];
  readonly middleware: Middleware[] = [];

  use(middleware: Middleware) {
    this.middleware.push(middleware);
    return this;
  }

  route(route: any, ...middleware: Middleware[]) {
    this.routes.push(new Route(route, middleware));
    return this;
  }

  abstract match(application: Application, context: any): Route[];

  handle(application: Application, context: any, next?: Dispatcher) {
    const routes = this.match(application, context);
    if ( ! routes.length) {
      return next(context);
    }

    const middleware = compose(this.middleware);
    return middleware(application, context, (application, context) => {
      const middleware = compose(routes.map((route): Middleware => {
        return (application, context, next) => {
          return route.handle(application, context, next);
        }
      }));

      return middleware(application, context, next);
    });
  }
}
