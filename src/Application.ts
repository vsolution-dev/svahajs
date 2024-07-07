import { Router } from "./Router";
import { Container } from "./Container";
import { compose, Middleware } from "./Middleware";

export class Application extends Container {

  middleware: Middleware[] = [];

  use(middleware: Middleware | Router) {
    if (middleware instanceof Router) {
      middleware = Router.wrap(middleware.with(this));
    }

    this.middleware.push(middleware);
    return this;
  }

  async handle(context: any) {
    const middleware = compose(this.middleware);
    return await middleware(this.for(context).invalidate());
  }

  perform(context: any) {
    return this.handle(context);
  }

  listen(
    fetch: (context: any) => Promise<any>,
    reject?: (error, context: any) => void,
  ) {
    const loop = () => {
      fetch(this.dependencies).then((context) => {
        return this.handle(context);
      }).catch((error) => {
        if (reject) reject(error, this.dependencies);
      }).finally(() => {
        setTimeout(loop, 0);
      });
    };

    loop();
  }
}
