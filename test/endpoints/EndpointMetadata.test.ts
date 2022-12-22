import "reflect-metadata";
import { describe, it } from "@jest/globals";
import { HttpContext } from "../../src/core";
import { Endpoint, EndpointMetadata } from "../../src/endpoints";

describe("EndpointMetadata", () => {
  it(`The "path" setter of the "${EndpointMetadata.name}" class should set a path property on a class's prototype`, () => {
    // Arrange
    const expectedPath = "path/to/resource";

    class TestClass implements Endpoint {
      handle(context: HttpContext) {
        throw new Error("Method not implemented.");
      }
    }

    // Act/Assert
    const metadata = new EndpointMetadata(TestClass);

    metadata.path = expectedPath;
    expect(metadata.path).toEqual(expectedPath);

    const pathFromPrototype = Reflect.getMetadata(EndpointMetadata.pathKey, TestClass.prototype);
    expect(pathFromPrototype).toEqual(expectedPath);
  });

  it(`The "path" setter of the "${EndpointMetadata.name}" class should set a path property on an instance's prototype`, () => {
    // Arrange
    const expectedPath = "path/to/resource";

    class TestClass implements Endpoint {
      handle(context: HttpContext) {
        throw new Error("Method not implemented.");
      }
    }

    const instance = new TestClass();
    const metadata = new EndpointMetadata(instance);

    // Act/Assert
    metadata.path = expectedPath;
    expect(metadata.path).toEqual(expectedPath);

    const pathFromInstance = Reflect.getMetadata(
      EndpointMetadata.pathKey,
      Object.getPrototypeOf(instance)
    );
    expect(pathFromInstance).toEqual(expectedPath);
  });
});
