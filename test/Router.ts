import { Application } from "@/Application";
import { Middleware } from "@/Middleware";
import { Router as BaseRouter } from "@/Router";

class Router extends BaseRouter {
  constructor() {
    super();
  }

  match({ value }) {
    return this.routes.filter(({ route }) => {
      return value === route;
    });
  }
}

test('Router', async () => {
  const add: Middleware = (container, { value, amount }, next) => {
    container.bind('value', () => value + amount);
    return next();
  };

  const final: Middleware = (container, { value }, next) => value;

  const one = new Router();
  one.bind('amount', () => 1);
  one.use(add);         // 1 + 1 = 2
  one.use(add);         // 2 + 1 = 3
  one.route(1, add);    // 3 + 1 = 4
  one.route(1, add);    // 4 + 1 = 5
  one.route(2, add);
  one.route(2, add);
  one.route(1, final);  // 5

  const two = new Router();
  two.bind('amount', () => 2);
  two.use(add);         // 10 + 2
  two.use(add);         // 12 + 2
  two.route(10, add);   // 14 + 2
  two.route(10, add);   // 16 + 2
  two.route(10, add);   // 18 + 2
  two.route(12, add);
  two.route(10, final); // 20

  const application = new Application();
  application.use(one);
  application.use(two);

  expect(await application.perform({ value: 1 })).toBe(5);
  expect(await application.perform({ value: 10 })).toBe(20);
});
