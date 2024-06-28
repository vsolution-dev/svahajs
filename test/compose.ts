import { compose, Middleware } from "@/Middleware";
import { Container } from "../src/Container";

test('compose', async () => {
  const add: Middleware = (container, { value }, next) => {
    container.register('value', () => value + 1);
    return next();
  }

  const container =  new Container({ value: 1 });
  const middleware = compose([ add, add, add, add ]); // 5
  const value = await middleware(container, (container, { value }, next) => {
    return value;
  });

  expect(value).toBe(5);
});
