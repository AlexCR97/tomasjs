import { randomUUID } from "node:crypto";
import { TomasError } from "@/errors";

/**
 * Represents a globally unique identifier (GUID).
 *
 * This class provides methods to create, validate, and compare GUIDs.
 * It internally uses the built-in {@link randomUUID} function.
 */
export class Guid {
  private readonly value: string;

  private constructor(value: string) {
    if (!Guid.isValid(value)) {
      throw new InvalidGuidError(value);
    }

    this.value = value;
  }

  /**
   * Creates a new GUID using the {@link randomUUID} function.
   *
   * @returns {Guid} A new instance of {@link Guid} with a randomly generated value.
   *
   * @example
   * const newGuid = Guid.new();
   * console.log(newGuid.toString()); // Output: A newly generated GUID (e.g., '550e8400-e29b-41d4-a716-446655440000')
   */
  static new(): Guid {
    const value = randomUUID();
    return new Guid(value);
  }

  /**
   * Creates a {@link Guid} instance from a string value if it is valid.
   *
   * @param value - The string representation of the GUID.
   * @returns A {@link Guid} instance if the value is valid; otherwise, `null`.
   *
   * @example
   * const guid = Guid.from('550e8400-e29b-41d4-a716-446655440000');
   * console.log(guid?.toString()); // Output: '550e8400-e29b-41d4-a716-446655440000'
   *
   * const invalidGuid = Guid.from('invalid-guid');
   * console.log(invalidGuid); // Output: null
   */
  static from(value: string): Guid | null {
    if (!Guid.isValid(value)) {
      return null;
    }

    return new Guid(value);
  }

  /**
   * Creates a {@link Guid} instance from a string value or throws an error if invalid.
   *
   * @param value - The string representation of the GUID.
   * @returns A {@link Guid} instance.
   * @throws {InvalidGuidError} If the value is not a valid GUID.
   *
   * @example
   * const guid = Guid.fromOrThrow('550e8400-e29b-41d4-a716-446655440000');
   * console.log(guid.toString()); // Output: '550e8400-e29b-41d4-a716-446655440000'
   *
   * // The following line will throw an InvalidGuidError:
   * // const invalidGuid = Guid.fromOrThrow('invalid-guid');
   */
  static fromOrThrow(value: string): Guid {
    return new Guid(value);
  }

  /**
   * Validates whether a string is a valid GUID.
   *
   * @param value - The string to validate.
   * @returns `true` if the string is a valid GUID; otherwise, `false`.
   *
   * @example
   * console.log(Guid.isValid('550e8400-e29b-41d4-a716-446655440000')); // Output: true
   * console.log(Guid.isValid('invalid-guid')); // Output: false
   */
  static isValid(value: string): boolean {
    return /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value);
  }

  /**
   * Checks if this GUID is equal to another GUID.
   *
   * @param guid - The GUID to compare against.
   * @returns `true` if the GUIDs are equal; otherwise, `false`.
   *
   * @example
   * const guid1 = Guid.from('550e8400-e29b-41d4-a716-446655440000');
   * const guid2 = Guid.from('550e8400-e29b-41d4-a716-446655440000');
   * console.log(guid1?.equals(guid2)); // Output: true
   *
   * const guid3 = Guid.from('550e8400-e29b-41d4-a716-446655440001');
   * console.log(guid1?.equals(guid3)); // Output: false
   */
  equals(guid: Guid): boolean {
    return this.value === guid.value;
  }

  /**
   * Returns the string representation of this GUID.
   *
   * @returns The string representation of the GUID.
   *
   * @example
   * const guid = Guid.from('550e8400-e29b-41d4-a716-446655440000');
   * console.log(guid?.toString()); // Output: '550e8400-e29b-41d4-a716-446655440000'
   */
  toString(): string {
    return this.value;
  }
}

/**
 * An error that occurs when an invalid GUID is provided.
 *
 * @extends TomasError
 */
export class InvalidGuidError extends TomasError {
  /**
   * @param value - The invalid GUID value.
   */
  constructor(value: string) {
    super(`core/InvalidGuid`, `The value "${value}" is not a valid Guid`, { data: { value } });
  }
}
