import { NotImplementedError } from "@/core/errors";

export function useInterceptor(interceptor: any) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    // TODO Implement useInterceptor decorator
    throw new NotImplementedError(useInterceptor.name);
  };
}
