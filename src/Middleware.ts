import { Container } from "@/Container";

export type Dispatcher = (delta?: number) => any
export type Middleware = (
  container: Container,
  context: any,
  next?: Dispatcher,
) => any;

export const compose = (middleware: Middleware[]) => {
  if ( ! Array.isArray(middleware)) {
    middleware = [ middleware ];
  }

  const dispatch = (index: number, container: Container, next?: Middleware) => {
    let handle = middleware[index];
    if (index >= middleware.length) {
      handle = next;
    }

    if ( ! handle) {
      return Promise.resolve();
    }

    try {
      return Promise.resolve(handle(container, container.dependencies, (delta = 1) => {
        return dispatch(index + delta, container, next);
      }))
    } catch (error) {
      return Promise.reject(error);
    }
  }

  return (context: any, next?: Middleware) => {
    if ( ! (context instanceof Container)) {
      context = new Container(context);
    }

    return dispatch(0, context, next);
  }
}
