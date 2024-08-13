import { IRequestContext, IResponseWriter } from "@/server";
import {
  IMiddleware,
  IMiddlewareFactory,
  isIMiddleware,
  isIMiddlewareFactory,
  isMiddlewareFunction,
  MiddlewareFunction,
  NextFunction,
} from "./Middleware";
import { HTTP_STATUS_CODES } from "@tomasjs/core/http";

describe("Middleware", () => {
  describe(isMiddlewareFunction.name, () => {
    it("should return true for named functions", () => {
      const arrowFunction: MiddlewareFunction = (req, res, next) => {};
      expect(isMiddlewareFunction(arrowFunction)).toBe(true);

      const inlineFunction: MiddlewareFunction = function (req, res, next) {};
      expect(isMiddlewareFunction(inlineFunction)).toBe(true);

      function declaredFunction(req: IRequestContext, res: IResponseWriter, next: NextFunction) {}
      expect(isMiddlewareFunction(declaredFunction)).toBe(true);
    });

    it("should return true for anonymous functions", () => {
      expect(
        isMiddlewareFunction((req: IRequestContext, res: IResponseWriter, next: NextFunction) => {})
      ).toBe(true);

      expect(
        isMiddlewareFunction(function (
          req: IRequestContext,
          res: IResponseWriter,
          next: NextFunction
        ) {})
      ).toBe(true);
    });

    it("should return true for functions with params in range", () => {
      expect(isMiddlewareFunction(() => {})).toBe(true);
      expect(isMiddlewareFunction((req: IRequestContext) => {})).toBe(true);
      expect(isMiddlewareFunction((req: IRequestContext, res: IResponseWriter) => {})).toBe(true);
    });

    it("should return false for functions with params out of range", () => {
      expect(
        isMiddlewareFunction(
          (req: IRequestContext, res: IResponseWriter, next: NextFunction, invalid: any) => {}
        )
      ).toBe(false);
    });
  });

  describe(isIMiddleware.name, () => {
    it("should return true for a middleware instance", () => {
      class TestMiddleware implements IMiddleware {
        run(req: IRequestContext, res: IResponseWriter, next: NextFunction): void {}
      }

      const middleware = new TestMiddleware();
      expect(isIMiddleware(middleware)).toBe(true);
    });

    it("should return true for a middleware instance with an async method", () => {
      class TestMiddleware implements IMiddleware {
        async run(req: IRequestContext, res: IResponseWriter, next: NextFunction): Promise<void> {
          return await res.withStatus(HTTP_STATUS_CODES.ok).send();
        }
      }

      const middleware = new TestMiddleware();
      expect(isIMiddleware(middleware)).toBe(true);
    });

    it("should return true for a middleware object with an arrow function", () => {
      const middleware: IMiddleware = {
        run: (req, res, next) => {},
      };

      expect(isIMiddleware(middleware)).toBe(true);
    });

    it("should return true for a middleware object with a declared function", () => {
      const middleware: IMiddleware = {
        run(req, res, next) {},
      };

      expect(isIMiddleware(middleware)).toBe(true);
    });
  });

  describe(isIMiddlewareFactory.name, () => {
    it("should return true for an instance", () => {
      class TestMiddleware implements IMiddlewareFactory {
        createMiddleware(): MiddlewareFunction {
          return (req, res, next) => {};
        }
      }

      const middleware = new TestMiddleware();
      expect(isIMiddlewareFactory(middleware)).toBe(true);
    });

    it("should return true for an object with an arrow function", () => {
      const middleware: IMiddlewareFactory = {
        createMiddleware: () => {
          return (req, res, next) => {};
        },
      };

      expect(isIMiddlewareFactory(middleware)).toBe(true);
    });

    it("should return true for an object with a declared function", () => {
      const middleware: IMiddlewareFactory = {
        createMiddleware() {
          return (req, res, next) => {};
        },
      };

      expect(isIMiddlewareFactory(middleware)).toBe(true);
    });
  });
});
