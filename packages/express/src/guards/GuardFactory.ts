import { ClassConstructor } from "@/container";
import { Guard } from "./Guard";
import { GuardFunction } from "./GuardFunction";

export interface GuardFactory<TGuard extends Guard = Guard> {
  create(): GuardFunction | TGuard | ClassConstructor<TGuard>;
}
