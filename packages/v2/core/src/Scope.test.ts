import { Scope, isScope } from "./Scope";

describe("Scope", () => {
  it(`Function ${isScope.name} returns true`, () => {
    const testValues: Scope[] = ["scoped", "singleton"];

    for (const value of testValues) {
      expect(isScope(value)).toBeTruthy();
    }
  });

  it(`Function ${isScope.name} returns false`, () => {
    const testValues = [
      undefined,
      null,
      NaN,
      1,
      true,
      false,
      "foo",
      function () {
        // anonymous function
      },
      function bar() {
        // named function
      },
      () => {
        // anonymous arrow function
      },
      (() => {
        const namedArrowFunction = () => {};
        return namedArrowFunction;
      })(),
    ];

    for (const value of testValues) {
      expect(isScope(value)).toBeFalsy();
    }
  });
});
