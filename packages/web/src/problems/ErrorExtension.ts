import { TomasError } from "@tomasjs/core/errors";
import { ProblemDetailsExtensionsFactory } from "./ProblemDetailsErrorHandler";

export function errorExtension(options?: { stack?: boolean }): ProblemDetailsExtensionsFactory {
  const includeStack = options?.stack ?? false;

  return ({ err }) => {
    const error = buildError(err);
    return { error };
  };

  function buildError(err: unknown): unknown {
    if (err instanceof Error) {
      let errRecord: Record<string, any> = {
        name: err.name,
        message: err.message,
      };

      if (includeStack) {
        errRecord["stack"] = err.stack;
      }

      if (err instanceof TomasError) {
        errRecord = {
          ...errRecord,
          code: err.code,
          data: err.data,
        };

        if (err.innerError) {
          errRecord["innerError"] = buildError(err.innerError);
        }
      }

      return errRecord;
    }

    return err;
  }
}
