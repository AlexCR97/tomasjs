import { IRequestContext } from "@/server";
import {
  IInterceptor,
  IInterceptorFactory,
  InterceptorFunction,
  isIInterceptor,
  isIInterceptorFactory,
  isInterceptorFunction,
} from "./Interceptor";

describe("app/Interceptor", () => {
  describe(isInterceptorFunction.name, () => {
    it("should return true for named functions", () => {
      const arrowFunction: InterceptorFunction = (req) => {};
      expect(isInterceptorFunction(arrowFunction)).toBe(true);

      const inlineFunction: InterceptorFunction = function (req) {};
      expect(isInterceptorFunction(inlineFunction)).toBe(true);

      function declaredFunction(req: IRequestContext) {}
      expect(isInterceptorFunction(declaredFunction)).toBe(true);
    });

    it("should return true for anonymous functions", () => {
      expect(isInterceptorFunction((req: IRequestContext) => {})).toBe(true);

      expect(isInterceptorFunction(function (req: IRequestContext) {})).toBe(true);
    });

    it("should return false for functions with params out of range", () => {
      expect(isInterceptorFunction((req: IRequestContext, invalid: any) => {})).toBe(false);
    });
  });

  describe(isIInterceptor.name, () => {
    it("should return true for an interceptor instance", () => {
      class TestInterceptor implements IInterceptor {
        intercept(req: IRequestContext): void {}
      }

      const myInterceptor = new TestInterceptor();
      expect(isIInterceptor(myInterceptor)).toBe(true);
    });

    it("should return true for an interceptor instance with an async method", () => {
      class TestInterceptor implements IInterceptor {
        async intercept(req: IRequestContext): Promise<void> {}
      }

      const myInterceptor = new TestInterceptor();
      expect(isIInterceptor(myInterceptor)).toBe(true);
    });

    it("should return true for an interceptor object with an arrow function", () => {
      const myInterceptor: IInterceptor = {
        intercept: (req) => {},
      };

      expect(isIInterceptor(myInterceptor)).toBe(true);
    });

    it("should return true for an interceptor object with a declared function", () => {
      const myInterceptor: IInterceptor = {
        intercept(req) {},
      };

      expect(isIInterceptor(myInterceptor)).toBe(true);
    });
  });

  describe(isIInterceptorFactory.name, () => {
    it("should return true for an instance", () => {
      class TestInterceptor implements IInterceptorFactory {
        createInterceptor(): InterceptorFunction {
          return (req) => {};
        }
      }

      const myInterceptor = new TestInterceptor();
      expect(isIInterceptorFactory(myInterceptor)).toBe(true);
    });

    it("should return true for an object with an arrow function", () => {
      const myInterceptor: IInterceptorFactory = {
        createInterceptor: () => {
          return (req) => {};
        },
      };

      expect(isIInterceptorFactory(myInterceptor)).toBe(true);
    });

    it("should return true for an object with a declared function", () => {
      const myInterceptor: IInterceptorFactory = {
        createInterceptor() {
          return (req) => {};
        },
      };

      expect(isIInterceptorFactory(myInterceptor)).toBe(true);
    });
  });
});
