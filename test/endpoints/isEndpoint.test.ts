import "reflect-metadata";
import { afterEach, beforeEach, describe, it } from "@jest/globals";
import { HttpContext } from "../../src/core";
import { Endpoint, isEndpoint } from "../../src/endpoints";

describe("isEndpoint", () => {
  beforeEach(async () => {});

  afterEach(async () => {});

  it(`The "${isEndpoint.name}" method should return true for a valid instance of an Endpoint`, () => {
    // Arrange
    class TestClass implements Endpoint {
      handle(context: HttpContext) {
        throw new Error("Method not implemented.");
      }
    }

    // Act/Assert
    const instance = new TestClass();
    expect(isEndpoint(instance)).toBeTruthy();
  });

  it(`The "${isEndpoint.name}" method should return false for an invalid instance of an Endpoint`, () => {
    // Arrange
    const someObject = {};

    // Act/Assert
    expect(isEndpoint(someObject)).toBeFalsy();
  });
});
