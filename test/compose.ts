import { Container } from "@/Container";
import { compose, Middleware } from "@/Middleware";

test('compose', async () => {
  const add: Middleware = (container, { value }, next) => {
    return next();
  }

  const container =  new Container();
  const middleware = compose([ add, add, add, add ]); // 5
  const value = await middleware(container.for({ value: 1 }), (container, { value }, next) => {
    return value;
  });

  expect(value).toBe(5);
});
