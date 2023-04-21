import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import { HttpContext, HttpMethod } from "../core";
import { EndpointMetadataKeys, EndpointPrototypeMetadata } from "./metadata";
import { endpoint } from "./@endpoint";
import { Endpoint } from "./Endpoint";

describe("endpoint-decorator", () => {
  it(`The "${endpoint.name}" decorator should set a default httpMethod ("get") property on an Endpoint class's prototype`, () => {
    // Arrange
    const defaultMethod: HttpMethod = "get";

    //@ts-ignore: Fix decorators not working in test files
    @endpoint()
    class TestClass implements Endpoint {
      handle(context: HttpContext) {
        throw new Error("Method not implemented.");
      }
    }

    // Act/Assert
    const metadata = new EndpointPrototypeMetadata(TestClass);
    expect(metadata.httpMethod).toEqual(defaultMethod);

    const methodFromPrototype = Reflect.getMetadata(
      EndpointMetadataKeys.httpMethodKey,
      TestClass.prototype
    );
    expect(methodFromPrototype).toEqual(defaultMethod);
  });

  it(`The "${endpoint.name}" decorator should set an httpMethod property on an Endpoint class's prototype`, () => {
    // Arrange
    const expectedMethod: HttpMethod = "post";

    //@ts-ignore: Fix decorators not working in test files
    @endpoint(expectedMethod)
    class TestClass implements Endpoint {
      handle(context: HttpContext) {
        throw new Error("Method not implemented.");
      }
    }

    // Act/Assert
    const metadata = new EndpointPrototypeMetadata(TestClass);
    expect(metadata.httpMethod).toEqual(expectedMethod);

    const methodFromPrototype = Reflect.getMetadata(
      EndpointMetadataKeys.httpMethodKey,
      TestClass.prototype
    );
    expect(methodFromPrototype).toEqual(expectedMethod);
  });

  it(`The "${endpoint.name}" decorator should set an httpMethod property on an Endpoint instance's prototype`, () => {
    // Arrange
    const expectedMethod: HttpMethod = "post";

    //@ts-ignore: Fix decorators not working in test files
    @endpoint(expectedMethod)
    class TestClass implements Endpoint {
      handle(context: HttpContext) {
        throw new Error("Method not implemented.");
      }
    }

    // Act/Assert
    const instance = new TestClass();

    const metadata = new EndpointPrototypeMetadata(instance);
    expect(metadata.httpMethod).toEqual(expectedMethod);

    const methodFromInstance = Reflect.getMetadata(
      EndpointMetadataKeys.httpMethodKey,
      Object.getPrototypeOf(instance)
    );
    expect(methodFromInstance).toEqual(expectedMethod);
  });

  it(`The "${endpoint.name}" decorator should NOT change the class's name to be anonymous`, () => {
    // Arrange
    const emptyString = "";

    //@ts-ignore: Fix decorators not working in test files
    @endpoint()
    class TestClass implements Endpoint {
      handle(context: HttpContext) {
        throw new Error("Method not implemented.");
      }
    }

    // Act/Assert
    expect(TestClass.name).toBeTruthy();
    expect(TestClass.name).not.toEqual(emptyString);
  });
});
