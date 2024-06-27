import {compose, Middleware} from "@/Middleware";

test('compose', async () => {
  const add: Middleware = (application, { value }, next) => {
    return next({ value: value + 1 });
  }

  const middleware = compose([ add, add, add, add ]); // 5
  const value = await middleware(null, { value: 1 }, (application, { value }, next) => {
    return value;
  });

  expect(value).toBe(5);
});
