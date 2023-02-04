import { NotImplementedError } from "@/core/errors";
import { GuardType } from "@/guards";

export function useGuard(guard: GuardType) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    // TODO Implement useGuard decorator
    throw new NotImplementedError(useGuard.name);
  };
}
