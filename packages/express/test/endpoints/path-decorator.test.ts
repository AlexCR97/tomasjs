import "reflect-metadata";
import { describe, it } from "@jest/globals";
import { Endpoint, path } from "../../src/endpoints";
import { HttpContext } from "../../src/core";
import { EndpointMetadataKeys, EndpointPrototypeMetadata } from "../../src/endpoints/metadata";

describe("path-decorator", () => {
  it(`The "${path.name}" decorator should set should set a path property on an Endpoint class's prototype`, () => {
    // Arrange
    const expectedPath = "path/to/resource";

    @path(expectedPath)
    class TestClass implements Endpoint {
      handle(context: HttpContext) {
        throw new Error("Method not implemented.");
      }
    }

    // Act/Assert
    const metadata = new EndpointPrototypeMetadata(TestClass);
    expect(metadata.path).toEqual(expectedPath);

    const pathFromPrototype = Reflect.getMetadata(
      EndpointMetadataKeys.pathKey,
      TestClass.prototype
    );
    expect(pathFromPrototype).toEqual(expectedPath);
  });

  it(`The "${path.name}" decorator should set a path property on an Endpoint instance's prototype`, () => {
    // Arrange
    const expectedPath = "path/to/resource";

    @path(expectedPath)
    class TestClass implements Endpoint {
      handle(context: HttpContext) {
        throw new Error("Method not implemented.");
      }
    }

    // Act/Assert
    const instance = new TestClass();

    const metadata = new EndpointPrototypeMetadata(instance);
    expect(metadata.path).toEqual(expectedPath);

    const pathFromInstance = Reflect.getMetadata(
      EndpointMetadataKeys.pathKey,
      Object.getPrototypeOf(instance)
    );
    expect(pathFromInstance).toEqual(expectedPath);
  });

  it(`The "${path.name}" decorator should NOT change the class's name to be anonymous`, () => {
    // Arrange
    const emptyString = "";

    @path("some/path/to/a/resource")
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
