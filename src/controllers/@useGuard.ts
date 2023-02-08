import { GuardType } from "@/guards";
import { ControllerMetadata } from "./metadata/ControllerMetadata";

export function useGuard(guard: GuardType) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    const metadata = new ControllerMetadata(constructor);
    metadata.addGuard(guard);
    return constructor;
  };
}
