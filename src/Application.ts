import { Router } from "@/Router";
import { compose, Middleware } from "@/Middleware";

export abstract class Application {

  private middleware: Middleware[] = [];

  use(middleware: Middleware | Router) {
    if (middleware instanceof Router) {
      middleware = Router.wrap(middleware);
    }

    this.middleware.push(middleware)
  }

  handle(context: any) {
    const middleware = compose(this.middleware);
    return middleware(context);
  }

  perform(context: any) {
    return this.handle(context);
  }

  listen(fetch: () => Promise<any>) {
    const loop = () => {
      return fetch().then(context => {
        return this.handle(context);
      }).finally(() => {
        setTimeout(loop, 0);
      });
    };

    return loop();
  }
}
