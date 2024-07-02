export const memoize = (callback: any) => {
  let cache: any = undefined;
  let isPromise = false;

  const memoized = function () {
    if (cache === undefined) {
      cache = callback.apply(this, arguments);

      if (cache instanceof Promise) {
        isPromise = true;
        return cache.then(value => {
          cache = value;
          return value;
        });
      }
    }

    return isPromise
      ? Promise.resolve(cache)
      : cache;
  }

  memoized.invalidate = () => {
    cache = undefined;
    isPromise = false;
  }

  return memoized;
}
