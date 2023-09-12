import { TomasError } from "@tomasjs/core";

export class UseFilesError extends TomasError {
  constructor() {
    super('Cannot use files. Did you forget to call ".useFiles()"?');
  }
}
