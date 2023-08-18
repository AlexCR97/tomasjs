import "reflect-metadata";
import { it, describe, expect } from "@jest/globals";
import { injectable } from "./@injectable";
import { ServiceContainer } from "./ServiceContainer";
import { UnknownTokenError } from "./UnknownTokenError";
import { RemoveTokenError } from "./RemoveTokenError";

describe("ServiceContainer", () => {
  it("Can add a class", () => {
    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class TestClass {
      sum(a: number, b: number): number {
        return a + b;
      }
    }

    const container = new ServiceContainer().addClass(TestClass);
    const testInstance = container.get<TestClass>(TestClass);

    expect(testInstance).toBeInstanceOf(TestClass);
    expect(testInstance.sum(1, 2)).toBe(3);
  });

  it("Can add an instance", () => {
    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class Cat {
      constructor(readonly name: string, readonly color: string, readonly favoriteFood: string) {}
    }

    const tomasFromInstantiation = new Cat("Tomas", "gray", "chicken");
    const container = new ServiceContainer().addInstance(
      tomasFromInstantiation,
      tomasFromInstantiation.name
    );
    const tomasFromContainer = container.get<Cat>(tomasFromInstantiation.name);
    expect(tomasFromContainer).toBe(tomasFromInstantiation);
    expect(tomasFromContainer.name).toBe(tomasFromInstantiation.name);
    expect(tomasFromContainer.color).toBe(tomasFromInstantiation.color);
    expect(tomasFromContainer.favoriteFood).toBe(tomasFromInstantiation.favoriteFood);
  });

  it("Should fail to get an unknown token", () => {
    const container = new ServiceContainer();
    try {
      container.get("Non existing token");
    } catch (err) {
      expect(err).toBeInstanceOf(UnknownTokenError);
    }
  });

  it("Should return undefined for an unknown token", () => {
    const container = new ServiceContainer();
    const service = container.getOrDefault("Non existing token");
    expect(service).toBeUndefined();
  });

  it("Can get all services with a registered token", () => {
    class Animal {
      constructor(readonly species: string) {}
    }

    class Cat extends Animal {}

    class Duck extends Animal {}

    const container = new ServiceContainer()
      .addInstance(new Cat("Fat cat"), Animal)
      .addInstance(new Duck("Rubber duck"), Animal);

    const animals = container.getAll<Animal>(Animal);

    expect(animals).toBeTruthy();
    expect(animals.length).toBe(2);
    expect(animals[0]).toBeInstanceOf(Cat);
    expect(animals[1]).toBeInstanceOf(Duck);
  });

  it("Should return an empty array if no services with the specified token were found", () => {
    const container = new ServiceContainer();
    const services = container.getAll("Non existing token");
    expect(services).toBeTruthy();
    expect(services.length).toBe(0);
  });

  it("Can determine if a token has already been used", () => {
    const container = new ServiceContainer().addInstance(1, "One");
    const hasOne = container.has("One");
    const hasTwo = container.has("Two");
    expect(hasOne).toBe(true);
    expect(hasTwo).toBe(false);
  });

  it("Can remove an existing token", () => {
    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class TestClass {}

    const container = new ServiceContainer().addClass(TestClass);
    const instance = container.get<TestClass>(TestClass);
    expect(instance).toBeInstanceOf(TestClass);

    container.remove(TestClass);
    const instanceOrDefault = container.getOrDefault(TestClass);
    expect(instanceOrDefault).toBeUndefined();
  });

  it("Should fail to remove a non existing token", () => {
    const container = new ServiceContainer();

    try {
      container.remove("Non existing token");
    } catch (err) {
      expect(err).toBeInstanceOf(RemoveTokenError);
    }
  });
});
