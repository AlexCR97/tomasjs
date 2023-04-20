import "reflect-metadata";
import { describe, it } from "@jest/globals";
import { HttpContext } from "../core";
import { Endpoint } from ".";
import { EndpointMetadataKeys, EndpointPrototypeMetadata } from "./metadata";

describe("EndpointMetadata", () => {
  it(`The "path" setter of the "${EndpointPrototypeMetadata.name}" class should set a path property on a class's prototype`, () => {
    // Arrange
    const expectedPath = "path/to/resource";

    class TestClass implements Endpoint {
      handle(context: HttpContext) {
        throw new Error("Method not implemented.");
      }
    }

    // Act/Assert
    const metadata = new EndpointPrototypeMetadata(TestClass);

    metadata.path = expectedPath;
    expect(metadata.path).toEqual(expectedPath);

    const pathFromPrototype = Reflect.getMetadata(
      EndpointMetadataKeys.pathKey,
      TestClass.prototype
    );
    expect(pathFromPrototype).toEqual(expectedPath);
  });

  it(`The "path" setter of the "${EndpointPrototypeMetadata.name}" class should set a path property on an instance's prototype`, () => {
    // Arrange
    const expectedPath = "path/to/resource";

    class TestClass implements Endpoint {
      handle(context: HttpContext) {
        throw new Error("Method not implemented.");
      }
    }

    const instance = new TestClass();
    const metadata = new EndpointPrototypeMetadata(instance);

    // Act/Assert
    metadata.path = expectedPath;
    expect(metadata.path).toEqual(expectedPath);

    const pathFromInstance = Reflect.getMetadata(
      EndpointMetadataKeys.pathKey,
      Object.getPrototypeOf(instance)
    );
    expect(pathFromInstance).toEqual(expectedPath);
  });

  // TODO Add tests for AnonymousEndpointMetadata
});
