import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import { TransformError, numberTransform } from "@tomasjs/core";

// TODO Move this to @tomasjs/core
describe("NumberTransform", () => {
  it(`The ${numberTransform.name} function transforms number to number`, () => {
    // Arrange
    const input = 10;
    const expectedOutput = 10;

    // Act
    const actualOutput = numberTransform(input);

    // Assert
    expect(actualOutput).toBe(expectedOutput);
    expect(typeof actualOutput).toBe("number");
  });

  it(`The ${numberTransform.name} function transforms string to number`, () => {
    // Arrange
    const input = "10";
    const expectedOutput = 10;

    // Act
    const actualOutput = numberTransform(input);

    // Assert
    expect(actualOutput).toBe(expectedOutput);
    expect(typeof actualOutput).toBe("number");
  });

  it(`The ${numberTransform.name} function fails to transforms undefined to number`, () => {
    // Arrange
    const input = undefined;

    // Act/Assert
    expect(() => numberTransform(input)).toThrowError(TransformError);
  });

  it(`The ${numberTransform.name} function fails to transforms null to number`, () => {
    // Arrange
    const input = null;

    // Act/Assert
    expect(() => numberTransform(input)).toThrowError(TransformError);
  });
});
