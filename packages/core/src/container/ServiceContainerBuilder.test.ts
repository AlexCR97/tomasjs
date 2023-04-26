import "reflect-metadata";
import { it, describe, expect } from "@jest/globals";
import { injectable } from "./@injectable";
import { ContainerSetupFunction } from "./ContainerSetupFunction";
import { ContainerSetupFactory } from "./ContainerSetupFactory";
import { ServiceContainerBuilder } from "./ServiceContainerBuilder";

describe("ServiceContainerBuilder", () => {
  it("Can add a class and get via the built Container", async () => {
    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class TestClass {}

    const container = await new ServiceContainerBuilder().addClass(TestClass).buildContainerAsync();
    const testInstance = container.get<TestClass>(TestClass);

    expect(testInstance).toBeInstanceOf(TestClass);
  });

  it("Can add a class and get via the built ServiceProvider", async () => {
    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class TestClass {}

    const services = await new ServiceContainerBuilder()
      .addClass(TestClass)
      .buildServiceProviderAsync();

    const testInstance = services.get<TestClass>(TestClass);

    expect(testInstance).toBeInstanceOf(TestClass);
  });

  it("Can add an instance and get via the built Container", async () => {
    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class Cat {
      constructor(readonly name: string, readonly color: string, readonly favoriteFood: string) {}
    }

    const tomasFromInstantiation = new Cat("Tomas", "gray", "chicken");

    const container = await new ServiceContainerBuilder()
      .addInstance(tomasFromInstantiation, tomasFromInstantiation.name)
      .buildContainerAsync();

    const tomasFromContainer = container.get<Cat>(tomasFromInstantiation.name);
    expect(tomasFromContainer).toBe(tomasFromInstantiation);
    expect(tomasFromContainer.name).toBe(tomasFromInstantiation.name);
    expect(tomasFromContainer.color).toBe(tomasFromInstantiation.color);
    expect(tomasFromContainer.favoriteFood).toBe(tomasFromInstantiation.favoriteFood);
  });

  it("Can add an instance and get via the built ServiceProvider", async () => {
    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class Cat {
      constructor(readonly name: string, readonly color: string, readonly favoriteFood: string) {}
    }

    const tomasFromInstantiation = new Cat("Tomas", "gray", "chicken");

    const services = await new ServiceContainerBuilder()
      .addInstance(tomasFromInstantiation, tomasFromInstantiation.name)
      .buildServiceProviderAsync();

    const tomasFromContainer = services.get<Cat>(tomasFromInstantiation.name);
    expect(tomasFromContainer).toBe(tomasFromInstantiation);
    expect(tomasFromContainer.name).toBe(tomasFromInstantiation.name);
    expect(tomasFromContainer.color).toBe(tomasFromInstantiation.color);
    expect(tomasFromContainer.favoriteFood).toBe(tomasFromInstantiation.favoriteFood);
  });

  it(`Can use the "setup" method to register services`, async () => {
    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class AClass {}

    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class BClass {}

    const services = await new ServiceContainerBuilder()
      .setup((container) => {
        container.addClass(AClass);
        container.addClass(BClass);
      })
      .buildServiceProviderAsync();

    const instanceOfA = services.get<AClass>(AClass);
    expect(instanceOfA).toBeInstanceOf(AClass);

    const instanceOfB = services.get<BClass>(BClass);
    expect(instanceOfB).toBeInstanceOf(BClass);
  });

  it("Can use a decoupled ContainerSetupFunction to register services", async () => {
    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class AClass {}

    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class BClass {}

    const decoupledSetup: ContainerSetupFunction = (container) => {
      container.addClass(AClass);
      container.addClass(BClass);
    };

    const services = await new ServiceContainerBuilder()
      .setup(decoupledSetup)
      .buildServiceProviderAsync();

    const instanceOfA = services.get<AClass>(AClass);
    expect(instanceOfA).toBeInstanceOf(AClass);

    const instanceOfB = services.get<BClass>(BClass);
    expect(instanceOfB).toBeInstanceOf(BClass);
  });

  it("Can use a ContainerSetupFactory to register services", async () => {
    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class AClass {}

    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class BClass {}

    class DecoupledSetupFactory implements ContainerSetupFactory {
      create(): ContainerSetupFunction {
        return (container) => {
          container.addClass(AClass);
          container.addClass(BClass);
        };
      }
    }

    const services = await new ServiceContainerBuilder()
      .setup(new DecoupledSetupFactory())
      .buildServiceProviderAsync();

    const instanceOfA = services.get<AClass>(AClass);
    expect(instanceOfA).toBeInstanceOf(AClass);

    const instanceOfB = services.get<BClass>(BClass);
    expect(instanceOfB).toBeInstanceOf(BClass);
  });
});
