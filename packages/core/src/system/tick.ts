import { nextTick } from "node:process";

/**
 * Returns a promise that resolves on the next tick of the event loop.
 *
 * This function is useful for deferring the execution of code until the next iteration
 * of the event loop, allowing the current operation to complete first.
 *
 * @returns {Promise<void>} A promise that resolves on the next tick of the event loop.
 *
 * @example
 * async function example() {
 *   console.log('Before tick');
 *   await tick();
 *   console.log('After tick');
 * }
 * // Output:
 * // Before tick
 * // After tick
 */
export async function tick(): Promise<void> {
  return new Promise<void>((resolve) => {
    nextTick(() => resolve());
  });
}
