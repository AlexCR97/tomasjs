import "reflect-metadata";
import { describe, it } from "@jest/globals";
import { HttpContext } from "../core";
import { Endpoint, isEndpoint } from ".";
import { bodyPipe } from "../pipes";
import { InstanceTransform } from "../transforms";

describe("isEndpoint", () => {
  it(`The "${isEndpoint.name}" method should return false for an invalid instance of an Endpoint`, () => {
    // Arrange
    const someObject = {};

    // Act/Assert
    expect(isEndpoint(someObject)).toBeFalsy();
  });

  it(`The "${isEndpoint.name}" method should return true for a valid instance of an Endpoint`, () => {
    // Arrange
    class TestEndpoint implements Endpoint {
      handle(context: HttpContext) {
        throw new Error("Method not implemented.");
      }
    }

    // Act/Assert
    const instance = new TestEndpoint();
    expect(isEndpoint(instance)).toBeTruthy();
  });

  it(`The "${isEndpoint.name}" method should return true for an Endpoint with a decorated "handle" method`, () => {
    // Arrange
    class User {}

    class EndpointWithDecoratedMethod implements Endpoint {
      @bodyPipe(new InstanceTransform(User))
      handle(context: HttpContext) {
        throw new Error("Method not implemented.");
      }
    }

    // Act/Assert
    const instance = new EndpointWithDecoratedMethod();
    expect(isEndpoint(instance)).toBeTruthy();
  });
});
