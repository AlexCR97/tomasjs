import { ClassConstructor } from "@tomasjs/core";
import { Guard } from "./Guard";
import { GuardFactory } from "./GuardFactory";
import { GuardFunction } from "./GuardFunction";

export type GuardType<TGuard extends Guard = Guard> =
  | GuardFunction
  | TGuard
  | ClassConstructor<TGuard>
  | GuardFactory;
