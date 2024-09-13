/**
 * Creates a promise that resolves after a specified amount of time.
 *
 * This function uses {@link setTimeout} to delay the resolution of the promise by the
 * given number of milliseconds.
 *
 * @param milliseconds The number of milliseconds to wait before resolving the promise.
 * @returns A promise that resolves after the specified timeout.
 *
 * @example
 * async function example() {
 *   console.log('Before timeout');
 *   await timeout(1000); // Wait for 1 second
 *   console.log('After timeout');
 * }
 * // Output:
 * // Before timeout
 * // (waits 1 second)
 * // After timeout
 */
export async function timeout(milliseconds: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), milliseconds);
  });
}
