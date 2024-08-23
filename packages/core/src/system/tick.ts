import { nextTick } from "node:process";

export async function tick(): Promise<void> {
  return new Promise<void>((resolve) => {
    nextTick(() => resolve());
  });
}
