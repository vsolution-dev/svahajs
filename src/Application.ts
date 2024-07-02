import { Router } from "./Router";
import { Container } from "./Container";
import { compose, Middleware } from "./Middleware";

export class Application extends Container {

  middleware: Middleware[] = [];

  public constructor() {
    super();
  }

  public use(middleware: Middleware | Router) {
    if (middleware instanceof Router) {
      middleware = Router.wrap(middleware.with(this));
    }

    this.middleware.push(middleware);
    return this;
  }

  async handle(context: any) {
    try {
      const middleware = compose(this.middleware);
      return await middleware(this.for(context));
    } catch (error) {
      throw error;
    } finally {
      this.invalidate();
    }
  }

  public perform(context: any) {
    return this.handle(context);
  }

  public listen(
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
