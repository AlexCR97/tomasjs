import { TomasError } from "@/errors";
import { Pipe } from "@/pipes";
import { readFileSync } from "fs";

export function readFile(path: string, encoding?: BufferEncoding) {
  try {
    return readFileSync(path, encoding);
  } catch (err) {
    throw new TomasError(`No such file "${path}"`, {
      data: { path },
      innerError: err,
    });
  }
}

export function readJsonFile<T>(path: string): T {
  return new Pipe(path)
    .apply((path) => readFile(path, "utf8") as string)
    .apply((content) => JSON.parse(content))
    .get();
}
