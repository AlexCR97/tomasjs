import { IServiceProvider } from "./ServiceProvider";

export type ServiceFactory<T> = (provider: IServiceProvider) => T;

export function isServiceFactory<T>(obj: any): obj is ServiceFactory<T> {
  if (obj === undefined || obj === null) {
    return false;
  }

  return typeof obj === "function";
}
