import "reflect-metadata";
import { it, describe, expect } from "@jest/globals";
import { ServiceContainerBuilder } from "./ServiceContainerBuilder";
import { ServiceContainerProvider } from "./ServiceContainerProvider";
import { ServiceProvider } from "./ServiceProvider";
import { serviceProviderToken } from "./serviceProviderToken";
import { inject } from "./@inject";
import { injectable } from "./@injectable";

describe("ServiceContainerProvider", () => {
  it("Can add the ServiceProvider to the DI container", async () => {
    const serviceProviderFromBuilder =
      await new ServiceContainerBuilder().buildServiceProviderAsync();

    const serviceProviderFromResolution =
      serviceProviderFromBuilder.get<ServiceProvider>(serviceProviderToken);

    expect(serviceProviderFromResolution).toBeInstanceOf(ServiceContainerProvider);
    expect(serviceProviderFromResolution).toBe(serviceProviderFromBuilder);
  });

  it("Can use the ServiceProvider to resolve services", async () => {
    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class TestClass {}

    const services = await new ServiceContainerBuilder()
      .addClass(TestClass)
      .buildServiceProviderAsync();

    const serviceProvider = services.get<ServiceProvider>(serviceProviderToken);
    const testInstance = serviceProvider.get<TestClass>(TestClass);
    expect(testInstance).toBeInstanceOf(TestClass);
  });

  it("Can resolve the ServiceProvider via DI", async () => {
    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class TestClass {
      constructor(
        //@ts-ignore: Fix decorators not working in test files
        @inject(serviceProviderToken) private readonly serviceProvider: ServiceProvider
      ) {}

      getServiceProviderFromDIResolution(): ServiceProvider {
        return this.serviceProvider;
      }
    }

    const serviceProviderFromBuilder = await new ServiceContainerBuilder()
      .addClass(TestClass)
      .buildServiceProviderAsync();

    const testInstance = serviceProviderFromBuilder.get<TestClass>(TestClass);
    const serviceProviderFromDIResolution = testInstance.getServiceProviderFromDIResolution();
    expect(serviceProviderFromDIResolution).toBeInstanceOf(ServiceContainerProvider);
    expect(serviceProviderFromDIResolution).toBe(serviceProviderFromBuilder);
  });
});
