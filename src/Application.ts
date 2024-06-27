import { Router } from "@/Router";
import { compose, Middleware } from "@/Middleware";

export abstract class Application {

  private isRunning: boolean = false;
  private middleware: Middleware[] = [];

  start() {
    this.isRunning = true;
    Promise.resolve()
      .then(() => this.setup())
      .then(() => this.listen())
  }

  stop() {
    this.isRunning = false;
  }

  async perform(context: any) {
    try {
      await this.setup();

      return await this.handle(context);
    } finally {
      await this.teardown();
    }
  }

  use(middleware: Middleware | Router) {
    if (middleware instanceof Router) {
      middleware = Router.wrap(middleware);
    }

    this.middleware.push(middleware)
  }

  handle(context: any) {
    const middleware = compose(this.middleware);
    return middleware(this, context);
  }

  setup() {
    process.on('SIGINT', () => {
      this.stop();
    });
  }

  teardown() {
    if ( process.env.NODE_ENV === 'production') {
      process.exit(0);
    }
  }

  abstract waitForNext(): Promise<any>;

  async listen() {
    await this.setup();

    do {
      const context = await this.waitForNext();
      try {
        await this.handle(context);
      } catch (error) {
        // ...
      }
    } while (this.isRunning);

    await this.teardown();
  }
}
