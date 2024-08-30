import { IServiceProvider } from "@tomasjs/core/dependency-injection";
import { Constructor, isConstructor, isFunction, isInRange, isNotNull } from "@tomasjs/core/system";
import {
  errorExtension,
  IProblemDetails,
  IProblemDetailsBuilder,
  problemDetails,
  ProblemDetailsExtensions,
  ProblemDetailsConfigureFunction as ServerProblemDetailsConfigureFunction,
  ProblemDetailsExtensionOption as ServerProblemDetailsExtensionOption,
} from "@/problems";
import { IRequestContext } from "@/server";
import { ErrorHandlerFunction, IErrorHandler, IErrorHandlerFactory } from "./ErrorHandler";
import { httpStatus } from "@/HttpStatus";

export type ProblemDetailsOptions = {
  configure?: ProblemDetailsConfigure;
  extensions?: ProblemDetailsExtensionOption[];
};

export type ProblemDetailsConfigure =
  | ProblemDetailsConfigureFunction
  | IProblemDetailsConfigure
  | Constructor<IProblemDetailsConfigure>;

export type ProblemDetailsConfigureFunction = (
  context: ProblemDetailsConfigureContext
) => ProblemDetailsConfigureResult | Promise<ProblemDetailsConfigureResult>;

export function isProblemDetailsConfigureFunction(
  obj: unknown
): obj is ProblemDetailsConfigureFunction {
  return isNotNull(obj) && isFunction(obj) && isInRange(obj.length, 0, 1);
}

export interface IProblemDetailsConfigure {
  configure(
    context: ProblemDetailsConfigureContext
  ): ProblemDetailsConfigureResult | Promise<ProblemDetailsConfigureResult>;
}

export function isIProblemDetailsConfigure(obj: unknown): obj is IProblemDetailsConfigure {
  return (
    isNotNull(obj) &&
    isProblemDetailsConfigureFunction((obj as IProblemDetailsConfigure)["configure"])
  );
}

export type ProblemDetailsConfigureContext = {
  req: IRequestContext;
  err: unknown;
  problem: IProblemDetailsBuilder;
  services: IServiceProvider;
};

export type ProblemDetailsConfigureResult = IProblemDetails | IProblemDetailsBuilder;

export type ProblemDetailsExtensionOption =
  | ProblemDetailsExtensions
  | ProblemDetailsExtensionsFactory
  | IProblemDetailsExtensions
  | Constructor<IProblemDetailsExtensions>;

export type ProblemDetailsExtensionsFactory = (
  context: ProblemDetailsExtensionsFactoryContext
) => ProblemDetailsExtensions | Promise<ProblemDetailsExtensions>;

export function isProblemDetailsExtensionsFactory(
  obj: unknown
): obj is ProblemDetailsExtensionsFactory {
  return isNotNull(obj) && isFunction(obj) && isInRange(obj.length, 0, 1);
}

export interface IProblemDetailsExtensions {
  extend(
    context: ProblemDetailsExtensionsFactoryContext
  ): ProblemDetailsExtensions | Promise<ProblemDetailsExtensions>;
}

export function isIProblemDetailsExtensions(obj: unknown): obj is IProblemDetailsExtensions {
  return (
    isNotNull(obj) &&
    isProblemDetailsExtensionsFactory((obj as IProblemDetailsExtensions)["extend"])
  );
}

export type ProblemDetailsExtensionsFactoryContext = {
  req: IRequestContext;
  err: unknown;
  services: IServiceProvider;
};

export class ProblemDetailsErrorHandler implements IErrorHandlerFactory {
  private _configure: ProblemDetailsConfigure | undefined;
  private _extensions: ProblemDetailsExtensionOption[] = [];

  configure(configure: ProblemDetailsConfigure): this {
    this._configure = configure;
    return this;
  }

  extend(extension: ProblemDetailsExtensionOption): this {
    this._extensions.push(extension);
    return this;
  }

  createErrorHandler(): ErrorHandlerFunction | IErrorHandler {
    return ({ req, res, err, services }) => {
      const configure = this.toServerProblemDetailsConfigureFunction(this._configure, services);

      const extensions = this._extensions.map((extension) =>
        this.toServerProblemDetailsExtensionOption(extension, services)
      );

      const errorHandlerFunc = problemDetails({
        configure,
        extensions,
      });

      return errorHandlerFunc({ req, res, err });
    };
  }

  private toServerProblemDetailsConfigureFunction(
    configure: ProblemDetailsConfigure | undefined,
    services: IServiceProvider
  ): ServerProblemDetailsConfigureFunction | undefined {
    if (configure === undefined) {
      return undefined;
    }

    if (isConstructor(configure)) {
      return async ({ req, err, problem }) => {
        try {
          const service = services.lastOrThrow(configure);
          return service.configure({ req, err, problem, services });
        } catch (error) {
          const { type, title, code: status, details } = httpStatus.internalServerError;

          const fallbackErrorExtensionFactory = errorExtension({ stack: true });
          const fallbackErrorExtension = await fallbackErrorExtensionFactory({ req, err: error });

          return problem
            .withType(type)
            .withStatus(status)
            .withTitle(title)
            .withDetails(details)
            .setExtension("error", fallbackErrorExtension.error);
        }
      };
    }

    if (isProblemDetailsConfigureFunction(configure)) {
      return ({ req, err, problem }) => {
        return configure({ req, err, problem, services });
      };
    }

    if (isIProblemDetailsConfigure(configure)) {
      return ({ req, err, problem }) => {
        return configure.configure({ req, err, problem, services });
      };
    }

    throw new TypeError(`Unknown configure type: ${configure}`);
  }

  private toServerProblemDetailsExtensionOption(
    extension: ProblemDetailsExtensionOption,
    services: IServiceProvider
  ): ServerProblemDetailsExtensionOption {
    if (isConstructor<IProblemDetailsExtensions>(extension)) {
      return ({ req, err }) => {
        try {
          const service = services.lastOrThrow(extension);
          return service.extend({ req, err, services });
        } catch (error) {
          const fallbackErrorExtensionFactory = errorExtension({ stack: true });
          return fallbackErrorExtensionFactory({ req, err: error });
        }
      };
    }

    if (isProblemDetailsExtensionsFactory(extension)) {
      return ({ req, err }) => {
        return extension({ req, err, services });
      };
    }

    if (isIProblemDetailsExtensions(extension)) {
      return ({ req, err }) => {
        return extension.extend({ req, err, services });
      };
    }

    return extension;
  }
}
