import { describe, it } from "@std/testing/bdd";
import { createContainer, Factory, Key, Resolver } from "./di.ts";
import { assertExists, assertStrictEquals } from "@std/assert";
import { add } from "./main.ts";

describe("di", () => {
  it("Can build a resolver", () => {
    const container = createContainer();
    const resolver = container.build();
    assertExists(resolver);
  });

  it("Can register a value service", () => {
    const key: Key = "Pi";
    const pi: number = Math.PI;

    const container = createContainer();
    container.add("singleton", key, pi);

    const resolver = container.build();
    const service = resolver.get<number>(key);
    assertStrictEquals(service, pi);
  });

  it("Can register a factory service", () => {
    const key: Key = "Pi";
    const pi: number = Math.PI;

    const container = createContainer();
    container.add("singleton", "Pi", () => pi);

    const resolver = container.build();
    const service = resolver.get<number>(key);
    assertStrictEquals(service, pi);
  });

  it("Can resolve dependencies", () => {
    const add = (a: number, b: number): number => a + b;

    const multiply = (a: number, b: number): number => a * b;

    const calculate: Factory<(a: number, b: number) => number> = (resolver) => {
      const addFunc = resolver.get<typeof add>(add.name);
      const multiplyFunc = resolver.get<typeof multiply>(multiply.name);
      return (a, b) => addFunc(a, b) + multiplyFunc(a, b);
    };

    const container = createContainer();
    container.addSingleton(add.name, add);
    container.addSingleton(multiply.name, multiply);
    container.addSingleton(calculate.name, calculate);

    const resolver = container.build();
    const calculator = resolver.get<ReturnType<typeof calculate>>(
      calculate.name
    );
    const result = calculator(1, 2);
    assertStrictEquals(result, 5);
  });
});
