import { ClassConstructor, internalContainer, isClassConstructor } from "@/container";
import { TomasError } from "@/core/errors";
import { Guard } from "./Guard";
import { GuardContext } from "./GuardContext";
import { GuardFactory } from "./GuardFactory";
import { GuardFunction } from "./GuardFunction";
import { GuardResult } from "./GuardResult";
import { GuardType } from "./GuardType";

export class GuardBridge {
  constructor(private readonly guard: GuardType) {}

  isAllowed(context: GuardContext): GuardResult {
    if (this.isFunction(this.guard)) {
      return this.guard(context);
    }

    if (this.isInstance(this.guard)) {
      return this.guard.isAllowed(context);
    }

    if (this.isConstructor(this.guard)) {
      const guardInstance = internalContainer.get(this.guard);
      return guardInstance.isAllowed(context);
    }

    if (this.isFactory(this.guard)) {
      const guardType = this.guard.create();
      return new GuardBridge(guardType).isAllowed(context);
    }

    throw new TomasError(`Unknown guard ${this.guard}`);
  }

  private isFunction(guard: GuardType): guard is GuardFunction {
    if (typeof guard !== "function") {
      return false;
    }

    // Considering that a GuardFunction must be a function...
    return (
      guard.prototype === undefined && // The prototype must be undefined
      guard.length === 1 // It must receive 1 argument
    );
  }

  private isInstance(guard: GuardType): guard is Guard {
    const func = (guard as any).isAllowed as Function;

    if (typeof func !== "function") {
      return false;
    }

    // Considering that the "isAllowed" must be a named function...
    return (
      func.name.trim() === "isAllowed" && // The name must be "isAllowed"
      func.prototype === undefined && // The prototype must be undefined
      func.length === 1 // It must receive 1 argument
    );
  }

  private isConstructor(guard: GuardType): guard is ClassConstructor<Guard> {
    if (typeof guard !== "function") {
      return false;
    }

    return isClassConstructor(guard as any); // TODO Improve type check
  }

  private isFactory(guard: GuardType): guard is GuardFactory {
    const func = (guard as any).create as Function;

    if (typeof func !== "function") {
      return false;
    }

    // Considering that the "create" must be a named function...
    return (
      func.name.trim() === "create" && // The name must be "create"
      func.prototype === undefined && // The prototype must be undefined
      func.length === 1 // It must receive 1 argument
    );
  }
}
