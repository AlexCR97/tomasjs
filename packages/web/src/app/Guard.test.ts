import { IRequestContext } from "@/server";
import {
  GuardFunction,
  GuardResult,
  IGuard,
  IGuardFactory,
  isGuardFunction,
  isIGuard,
  isIGuardFactory,
} from "./Guard";

describe("app/Guard", () => {
  describe(isGuardFunction.name, () => {
    it("should return true for named functions", () => {
      const arrowFunction: GuardFunction = (req) => true;
      expect(isGuardFunction(arrowFunction)).toBe(true);

      const inlineFunction: GuardFunction = function (req) {
        return true;
      };
      expect(isGuardFunction(inlineFunction)).toBe(true);

      function declaredFunction(req: IRequestContext) {
        return true;
      }
      expect(isGuardFunction(declaredFunction)).toBe(true);
    });

    it("should return true for anonymous functions", () => {
      expect(isGuardFunction((req: IRequestContext) => true)).toBe(true);

      expect(
        isGuardFunction(function (req: IRequestContext) {
          return true;
        })
      ).toBe(true);
    });

    it("should return false for functions with params out of range", () => {
      expect(isGuardFunction((req: IRequestContext, invalid: any) => true)).toBe(false);
    });
  });

  describe(isIGuard.name, () => {
    it("should return true for a guard instance", () => {
      class MyGuard implements IGuard {
        protect(req: IRequestContext): GuardResult {
          return true;
        }
      }

      const myGuard = new MyGuard();
      expect(isIGuard(myGuard)).toBe(true);
    });

    it("should return true for a guard instance with an async method", () => {
      class MyGuard implements IGuard {
        async protect(req: IRequestContext): Promise<GuardResult> {
          return true;
        }
      }

      const myGuard = new MyGuard();
      expect(isIGuard(myGuard)).toBe(true);
    });

    it("should return true for a guard object with an arrow function", () => {
      const myGuard: IGuard = {
        protect: (req) => true,
      };

      expect(isIGuard(myGuard)).toBe(true);
    });

    it("should return true for a guard object with a declared function", () => {
      const myGuard: IGuard = {
        protect(req) {
          return true;
        },
      };

      expect(isIGuard(myGuard)).toBe(true);
    });
  });

  describe(isIGuardFactory.name, () => {
    it("should return true for an instance", () => {
      class MyGuard implements IGuardFactory {
        createGuard(): GuardFunction {
          return (req) => true;
        }
      }

      const myGuard = new MyGuard();
      expect(isIGuardFactory(myGuard)).toBe(true);
    });

    it("should return true for an object with an arrow function", () => {
      const myGuard: IGuardFactory = {
        createGuard: () => {
          return (req) => true;
        },
      };

      expect(isIGuardFactory(myGuard)).toBe(true);
    });

    it("should return true for an object with a declared function", () => {
      const myGuard: IGuardFactory = {
        createGuard() {
          return (req) => true;
        },
      };

      expect(isIGuardFactory(myGuard)).toBe(true);
    });
  });
});
