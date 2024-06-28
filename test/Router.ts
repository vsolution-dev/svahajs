import { Application } from "@/Application";
import { Router } from "@/Router";
import { Middleware } from "@/Middleware";

class SampleApplication extends Application {
  waitForNext(): Promise<any> {
    return Promise.resolve(undefined);
  }
}

class SampleRouter extends Router {
  match({ value }) {
    return this.routes.filter(({ route }) => {
      return value === route;
    });
  }
}

const add: Middleware = (container, { value }, next) => {
  container.register('value', () => value + 1);
  return next();
};

const final: Middleware = (container, { value }, next) => {
  return value;
};

test('Router', async () => {
  const router = new SampleRouter();
  router.use(add); // 1
  router.use(add); // 2
  router.route(1, add, add); // 3, 4
  router.route(2, add);
  router.route(2, add);
  router.route(1, final); // 5

  const application = new SampleApplication();
  application.use(router);

  const value = await application.perform({
    value: 1
  });

  expect(value).toBe(5);
});
