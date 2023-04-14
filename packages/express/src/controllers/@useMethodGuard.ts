import { GuardType } from "@/guards";
import { HttpMethodMetadata } from "./metadata";

export function useMethodGuard(guard: GuardType) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const metadata = new HttpMethodMetadata(target, propertyKey);
    metadata.addGuard(guard);
  };
}
