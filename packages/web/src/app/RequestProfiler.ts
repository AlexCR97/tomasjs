import { IQueryParams } from "@/server";
import { ContainerSetupFunction, inject } from "@tomasjs/core/dependency-injection";
import { IHttpContent, PlainHttpHeaders } from "@tomasjs/core/http";
import { ILogger, ILoggerBuilder, LOGGER_BUILDER } from "@tomasjs/core/logging";
import { pipe } from "@tomasjs/core/system";
import { IMiddlewareFactory, MiddlewareFunction } from "./Middleware";

const REQUEST_PROFILER_OPTIONS = "@tomasjs/web/RequestProfilerOptions";

const DEFAULT_PADDING = 4;

export type RequestProfilerOptions = {
  headers: boolean;
  query: boolean;
  body: boolean;
  padding: number;
};

export function requestProfilerOptions(
  options: Partial<RequestProfilerOptions>
): ContainerSetupFunction {
  return (container) => {
    container.add("singleton", REQUEST_PROFILER_OPTIONS, options);
  };
}

export class RequestProfiler implements IMiddlewareFactory {
  constructor(
    @inject(REQUEST_PROFILER_OPTIONS, { multiple: true })
    private readonly options: RequestProfilerOptions[],

    @inject(LOGGER_BUILDER)
    private readonly loggerBuilder: ILoggerBuilder
  ) {}

  createMiddleware(): MiddlewareFunction {
    const logger = this.loggerBuilder.withCategory(`@tomasjs/web/${RequestProfiler.name}`).build();
    const options = this.getOptions();
    return requestProfiler({ logger, ...options });
  }

  private getOptions(): RequestProfilerOptions {
    if (this.options.length === 0) {
      return {
        headers: false,
        query: false,
        body: false,
        padding: DEFAULT_PADDING,
      };
    }

    if (this.options.length === 1) {
      return this.options[0];
    }

    return this.options[this.options.length - 1];
  }
}

export function requestProfiler(
  options: { logger: ILogger } & Partial<RequestProfilerOptions>
): MiddlewareFunction {
  const logger = options.logger;
  const logHeaders: boolean = options.headers ?? false;
  const logQuery: boolean = options.query ?? false;
  const logBody: boolean = options.body ?? false;
  const padding: number = options.padding ?? DEFAULT_PADDING;

  return async ({ req, res, next }) => {
    logger.info("HTTP {method} {path} executing...", {
      method: req.method,
      path: req.path,
    });

    if (logHeaders && Object.keys(req.headers).length > 0) {
      logger.info("Headers:\n{headers}", { headers: headersToString(req.headers) });
    }

    if (logQuery && req.query.keys.length > 0) {
      logger.info("Query:\n{query}", { query: queryToString(req.query) });
    }

    if (logBody && req.body.data.length > 0) {
      logger.info("Body:\n{body}", { body: bodyToString(req.body) });
    }

    const milliseconds = await measureMilliseconds(async () => await next());

    logger.info("HTTP {method} {path} responded {status} in {milliseconds}ms", {
      method: req.method,
      path: req.path,
      status: res.status,
      milliseconds,
    });
  };

  function headersToString(headers: PlainHttpHeaders): string {
    return pipe(headers)
      .pipe((headers) => {
        return Object.keys(headers).map((key) => `${key}: ${headers[key]}`);
      })
      .pipe((strs) => strs.map((str) => str.padStart(str.length + padding, " ")))
      .pipe((keyValuePairs) => keyValuePairs.join("\n"))
      .get();
  }

  function queryToString(query: IQueryParams): string {
    return pipe(query)
      .pipe((query) => {
        return query.keys.map((key) => `${key}=${query.get(key)}`);
      })
      .pipe((strs) => strs.map((str) => str.padStart(str.length + padding, " ")))
      .pipe((keyValuePairs) => keyValuePairs.join("\n"))
      .get();
  }

  function bodyToString(body: IHttpContent<unknown>): string {
    return pipe(body)
      .pipe((body) => body.toString())
      .pipe((str) => str.padStart(str.length + padding, " "))
      .get();
  }

  async function measureMilliseconds(func: () => Promise<any>): Promise<number> {
    const start = performance.now();
    await func();
    const end = performance.now();
    const milliseconds = end - start;
    return Math.round(milliseconds);
  }
}
