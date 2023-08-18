import "reflect-metadata";
import { it, describe, expect } from "@jest/globals";
import { isClassConstructor } from "./isClassConstructor";
import { injectable } from "../container/@injectable";

describe("isClassConstructor", () => {
  it("Returns true for a class", () => {
    class TestClass {}
    expect(isClassConstructor(TestClass)).toBe(true);
  });

  it("Returns true for a decorated class", () => {
    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class TestClass {}
    expect(isClassConstructor(TestClass)).toBe(true);
  });

  it("Returns true for a class with inheritance", () => {
    class ParentClass {}
    class ChildClass extends ParentClass {}
    expect(isClassConstructor(ChildClass)).toBe(true);
  });

  it("Returns true for a class that implements an interface", () => {
    interface TestInterface {}
    class TestClass implements TestInterface {}
    expect(isClassConstructor(TestClass)).toBe(true);
  });

  it("Returns true for a decorated class with inheritance that implements an interface", () => {
    class ParentClass {}

    interface TestInterface {}

    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class ChildClass extends ParentClass implements TestInterface {}

    expect(isClassConstructor(ChildClass)).toBe(true);
  });

  it("Returns true for an abstract class", () => {
    abstract class TestClass {}
    expect(isClassConstructor(TestClass)).toBe(true);
  });

  it("Returns false for an anonymous arrow function", () => {
    expect(isClassConstructor(() => {})).toBe(false);
  });

  it("Returns false for a named arrow function", () => {
    const namedArrowFunction = () => {};
    expect(isClassConstructor(namedArrowFunction)).toBe(false);
  });

  it("Returns false for an anonymous function", () => {
    expect(isClassConstructor(function () {})).toBe(false);
  });

  it("Returns false for a named function", () => {
    function namedFunction() {}
    expect(isClassConstructor(namedFunction)).toBe(false);
  });

  it("Returns false for an anonymous number", () => {
    expect(isClassConstructor(1)).toBe(false);
  });

  it("Returns false for a named number", () => {
    const namedNumber = 1;
    expect(isClassConstructor(namedNumber)).toBe(false);
  });

  it("Returns false for an anonymous string", () => {
    expect(isClassConstructor("class TestClass {}")).toBe(false);
  });

  it("Returns false for a named string", () => {
    const namedString = "class TestClass {}";
    expect(isClassConstructor(namedString)).toBe(false);
  });

  it("Returns false for an anonymous object", () => {
    expect(isClassConstructor({})).toBe(false);
  });

  it("Returns false for a named object", () => {
    const namedObject = {};
    expect(isClassConstructor(namedObject)).toBe(false);
  });
});
