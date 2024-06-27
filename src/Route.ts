import { compose, Dispatcher, Middleware } from "@/Middleware";
import { Application } from "@/Application";

export class Route {
  constructor(
    readonly route: any,
    readonly middleware: Middleware[],
  ) {
  }

  handle(application: Application, context: any, next?: Dispatcher) {
    const middleware = compose(this.middleware);
    return middleware(application, context, (application, context) => {
      return next(context);
    });
  }
}
