import { isFunction, isInRange, isNotNull } from "@tomasjs/core/system";
import { httpStatus } from "@/HttpStatus";
import { ProblemDetailsContent } from "@/content";
import { ErrorHandlerFunction } from "@/error-handler";
import { IRequestContext } from "@/server";
import {
  IProblemDetails,
  IProblemDetailsBuilder,
  ProblemDetails,
  ProblemDetailsBuilder,
  ProblemDetailsExtensions,
} from "./ProblemDetails";

export type ProblemDetailsOptions = {
  configure?: ProblemDetailsConfigureFunction;
  extensions?: ProblemDetailsExtensionOption[];
};

export type ProblemDetailsConfigureFunction = (
  context: ProblemDetailsConfigureContext
) => ProblemDetailsConfigureResult | Promise<ProblemDetailsConfigureResult>;

export type ProblemDetailsConfigureContext = {
  req: IRequestContext;
  err: unknown;
  problem: IProblemDetailsBuilder;
};

export type ProblemDetailsConfigureResult = IProblemDetails | IProblemDetailsBuilder;

export type ProblemDetailsExtensionOption =
  | ProblemDetailsExtensions
  | ProblemDetailsExtensionsFactory;

export type ProblemDetailsExtensionsFactory = (
  context: ProblemDetailsExtensionsFactoryContext
) => ProblemDetailsExtensions | Promise<ProblemDetailsExtensions>;

export type ProblemDetailsExtensionsFactoryContext = {
  req: IRequestContext;
  err: unknown;
};

export function isProblemDetailsExtensionsFactory(
  obj: unknown
): obj is ProblemDetailsExtensionsFactory {
  return isNotNull(obj) && isFunction(obj) && isInRange(obj.length, 0, 1);
}

export function problemDetails(options?: ProblemDetailsOptions): ErrorHandlerFunction {
  return async ({ req, res, err }) => {
    const { type, title, code: status, details } = httpStatus.internalServerError;

    const problem = new ProblemDetailsBuilder()
      .withType(type)
      .withStatus(status)
      .withTitle(title)
      .withDetails(details)
      .withInstance(req.path);

    if (options?.configure) {
      await configureProblemDetails({ req, err, problem, configure: options.configure });
    }

    if (options?.extensions) {
      await extendProblemDetails({ req, err, problem, extensions: options.extensions });
    }

    const problemDetails = problem.build();

    const responseContent = ProblemDetailsContent.from(problemDetails);

    return await res.withStatus(problemDetails.status).withContent(responseContent).send();
  };

  async function configureProblemDetails(options: {
    req: IRequestContext;
    err: unknown;
    problem: ProblemDetailsBuilder;
    configure: ProblemDetailsConfigureFunction;
  }): Promise<void> {
    const { req, err, problem, configure } = options;

    const result = await configure({ req, err, problem });

    if (result instanceof ProblemDetails) {
      problem.with(result);
      return;
    }

    if (result instanceof ProblemDetailsBuilder) {
      problem.with(result);
      return;
    }

    throw new TypeError(`Unknown Problem Details type: ${result}`);
  }

  async function extendProblemDetails(options: {
    req: IRequestContext;
    err: unknown;
    problem: ProblemDetailsBuilder;
    extensions: ProblemDetailsExtensionOption[];
  }): Promise<void> {
    const { req, err, problem, extensions } = options;

    for (const extension of extensions) {
      if (isProblemDetailsExtensionsFactory(extension)) {
        const extensions = await extension({ req, err });
        problem.addExtensions(extensions);
      } else {
        problem.addExtensions(extension);
      }
    }
  }
}
