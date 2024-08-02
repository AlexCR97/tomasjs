import { TomasError } from "@/errors";
import { readFileSync } from "fs";

export function readFile(path: string, encoding?: BufferEncoding): string | Buffer {
  try {
    return readFileSync(path, encoding);
  } catch (err) {
    throw new TomasError("core/files/FileNotFound", `No such file at path "${path}"`, {
      data: { path },
      innerError: err,
    });
  }
}

export function readJsonFile<T>(path: string): T {
  const content = readFile(path, "utf8") as string;
  return JSON.parse(content);
}
