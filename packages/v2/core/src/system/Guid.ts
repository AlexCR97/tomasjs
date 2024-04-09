import { randomUUID } from "crypto";
import { TomasError } from "@/errors";

export class Guid {
  private readonly value: string;

  private constructor(value: string) {
    if (!Guid.isValid(value)) {
      throw new InvalidGuidError(value);
    }

    this.value = value;
  }

  static new(): Guid {
    const value = randomUUID();
    return new Guid(value);
  }

  static from(value: string): Guid | null {
    if (!Guid.isValid(value)) {
      return null;
    }

    return new Guid(value);
  }

  static fromOrThrow(value: string): Guid {
    return new Guid(value);
  }

  static isValid(value: string): boolean {
    return /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value);
  }

  equals(guid: Guid): boolean {
    return this.value === guid.value;
  }

  toString(): string {
    return this.value;
  }
}

export class InvalidGuidError extends TomasError {
  constructor(value: string) {
    super(`core/InvalidGuid`, `The value "${value}" is not a valid Guid`, { data: { value } });
  }
}
