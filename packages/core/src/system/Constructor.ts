/**
 * Represents a class constructor for a generic type {@link T}.
 *
 * An object that can be instantiated with the `new` keyword, taking any number of
 * arguments, and returning an instance of type {@link T}, is considered a constructor.
 *
 * @template T The type of object that the constructor creates.
 */
export interface Constructor<T> {
  new (...args: any[]): T;
}

/**
 * Determines whether the provided object is a valid {@link Constructor}.
 *
 * @template T - The type of object the constructor creates.
 * @param {any} obj - The object to check.
 * @returns {obj is Constructor<T>} Returns `true` if the object is a valid {@link Constructor}, `false` otherwise.
 */
export function isConstructor<T>(obj: any): obj is Constructor<T> {
  // A constructor is essentially a function that returns an object
  if (typeof obj !== "function") {
    return false;
  }

  const objStr = obj.toString();

  // A constructor must have a string representation
  if (objStr === undefined || objStr === null) {
    return false;
  }

  /**
   * The string representation of a constructor is the actual class itself.
   *
   * E.g., for the class:
   * class TestClass {
   *    // class definitions
   * }
   *
   * The string representation is:
   * "class TestClass { ... "
   *
   * Therefore, we can infer that every constructor's string representation
   * starts with the word "class".
   */
  return objStr.startsWith("class");
}
