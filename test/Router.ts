import { Application } from "@/Application";
import { Middleware } from "@/Middleware";
import { Router as BaseRouter } from "@/Router";

class Router extends BaseRouter {
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
  const router = new Router();
  router.use(add); // 1
  router.use(add); // 2
  router.route(1, add); // 3
  router.route(1, add); // 4
  router.route(2, add);
  router.route(2, add);
  router.route(1, final); // 5

  const application = new Application();
  application.use(router);

  const value = await application.perform({
    value: 1
  });

  expect(value).toBe(5);
});
