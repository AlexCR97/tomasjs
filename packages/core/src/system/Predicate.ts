/**
 * A function that tests whether a given object meets certain criteria.
 *
 * This type represents a predicate function that takes an input of type {@link T} and returns a boolean value
 * indicating whether the input satisfies a condition.
 *
 * @template T The type of the object being tested.
 * @param {T} obj - The object to test.
 * @returns {boolean} `true` if the object satisfies the condition; otherwise, `false`.
 *
 * @example
 * const isEven: Predicate<number> = (num) => num % 2 === 0;
 * const result = isEven(4);
 * // result is true
 *
 * @example
 * const isNonEmptyString: Predicate<string> = (str) => str.length > 0;
 * const result = isNonEmptyString('');
 * // result is false
 */
export type Predicate<T> = (obj: T) => boolean;
