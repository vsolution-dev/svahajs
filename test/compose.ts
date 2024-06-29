import { Container } from "@/Container";
import { compose, Middleware } from "@/Middleware";

test('compose', async () => {
  const add: Middleware = (container, { value }, next) => {
    container.bind('value', () => value + 1);
    return next();
  }

  const container =  new Container({ value: 1 });
  const middleware = compose([ add, add, add, add ]); // 5
  const value = await middleware(container, (container, { value }, next) => {
    return value;
  });

  expect(value).toBe(5);
});
