import { isServiceFactory } from "./ServiceFactory";

describe("ServiceFactory", () => {
  it(`Function ${isServiceFactory.name} returns true`, () => {
    expect(
      isServiceFactory(function () {
        // anonymous function
      })
    ).toBeTruthy();

    expect(
      isServiceFactory(function bar() {
        // named function
      })
    ).toBeTruthy();

    expect(
      isServiceFactory(() => {
        // anonymous arrow function
      })
    ).toBeTruthy();

    expect(
      isServiceFactory(
        (() => {
          const namedArrowFunction = () => {};
          return namedArrowFunction;
        })()
      )
    ).toBeTruthy();
  });

  it(`Function ${isServiceFactory.name} returns false`, () => {
    expect(isServiceFactory(undefined)).toBeFalsy();
    expect(isServiceFactory(null)).toBeFalsy();
    expect(isServiceFactory(NaN)).toBeFalsy();
    expect(isServiceFactory(1)).toBeFalsy();
    expect(isServiceFactory(true)).toBeFalsy();
    expect(isServiceFactory(false)).toBeFalsy();
    expect(isServiceFactory("foo")).toBeFalsy();
  });
});
