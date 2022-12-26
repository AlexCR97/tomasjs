import { ClassConstructor } from "@/container";
import { Guard } from "./Guard";
import { GuardFunction } from "./GuardFunction";

export interface GuardFactory {
  create(): GuardFunction | Guard | ClassConstructor<Guard>;
}
