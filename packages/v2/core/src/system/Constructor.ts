export interface Constructor<T> {
  new (...args: any[]): T;
}

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
   * "class TestClass { ..."
   *
   * Therefore, we can infer that every constructor's string representation
   * starts with the word "class"
   */
  return objStr.startsWith("class");
}
