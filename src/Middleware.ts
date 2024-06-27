import { Application } from "@/Application";

export type Dispatcher = (payload?: {}, delta?: number) => any
export type Middleware = (
  application: Application,
  context: any,
  next?: Dispatcher
) => any;

export const compose = (middleware: Middleware[]) => {
  if ( ! Array.isArray(middleware)) {
    middleware = [ middleware ];
  }

  const dispatch = (index: number, application: Application, context: any, next?: Middleware) => {
    let handle = middleware[index];
    if (middleware.length === index) {
      handle = next;
    }

    if ( ! handle) {
      return Promise.resolve();
    }

    try {
      return Promise.resolve(handle(application, context, (payload = {}, delta = 1) => {
        return dispatch(index + delta, application, { ...context, ...payload }, next);
      }))
    } catch (error) {
      return Promise.reject(error);
    }
  }

  return (application?: Application, context?: any, next?: Middleware) => {
    return dispatch(0, application, context, next);
  }
}
