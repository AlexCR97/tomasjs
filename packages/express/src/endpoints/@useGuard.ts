import { GuardType } from "@/guards";
import { EndpointPrototypeMetadata } from "./metadata";

export function useGuard(guard: GuardType) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    const metadata = new EndpointPrototypeMetadata(constructor);
    metadata.addGuard(guard);
    return constructor;
  };
}
