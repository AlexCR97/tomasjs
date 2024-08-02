import { Constructor, isConstructor } from "./Constructor";

describe("Constructor", () => {
  it(`Function ${isConstructor.name} returns true`, () => {
    class SimpleClass {}

    class ClassThatExtends extends SimpleClass {}

    interface SimpleInterface {}

    class ClassThatImplements implements SimpleInterface {}

    class ClassThatExtendsAndImplements extends SimpleClass implements SimpleInterface {}

    abstract class AbstractClass {}

    const testValues: Constructor<any>[] = [
      SimpleClass,
      ClassThatExtends,
      ClassThatImplements,
      ClassThatExtendsAndImplements,
      AbstractClass as Constructor<any>,
    ];

    for (const value of testValues) {
      expect(isConstructor(value)).toBeTruthy();
    }
  });

  it(`Function ${isConstructor.name} returns false`, () => {
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
      expect(isConstructor(value)).toBeFalsy();
    }
  });
});
