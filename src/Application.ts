import { Router } from "@/Router";
import { compose, Middleware } from "@/Middleware";

export class Application {

  private middleware: Middleware[] = [];

  use(middleware: Middleware | Router) {
    if (middleware instanceof Router) {
      middleware = Router.wrap(middleware);
    }

    this.middleware.push(middleware);
    return this;
  }

  handle(context: any) {
    const middleware = compose(this.middleware);
    return middleware(context);
  }

  perform(context: any) {
    return this.handle(context);
  }

  listen(
    fetch: () => Promise<any>,
    reject: (error, context: any) => void
  ) {
    const loop = () => {
      fetch().then((context) => {
        return this.handle(context)
          .catch((error) => {
            reject(error, context);
          });
        }).finally(() => {
          setTimeout(loop, 0);
        });
    };

    loop();
  }
}
