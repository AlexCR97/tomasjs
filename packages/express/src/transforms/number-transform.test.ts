import "reflect-metadata";
import { describe, it } from "@jest/globals";
import { NumberTransform, TransformError } from ".";

describe("number-transform", () => {
  it(`The ${NumberTransform.name} function transforms number to number`, () => {
    // Arrange
    const input = 10;
    const expectedOutput = 10;

    // Act
    const actualOutput = NumberTransform(input);

    // Assert
    expect(actualOutput).toBe(expectedOutput);
    expect(typeof actualOutput).toBe("number");
  });

  it(`The ${NumberTransform.name} function transforms string to number`, () => {
    // Arrange
    const input = "10";
    const expectedOutput = 10;

    // Act
    const actualOutput = NumberTransform(input);

    // Assert
    expect(actualOutput).toBe(expectedOutput);
    expect(typeof actualOutput).toBe("number");
  });

  it(`The ${NumberTransform.name} function fails to transforms undefined to number`, () => {
    // Arrange
    const input = undefined;

    // Act/Assert
    expect(() => NumberTransform(input)).toThrowError(TransformError);
  });

  it(`The ${NumberTransform.name} function fails to transforms null to number`, () => {
    // Arrange
    const input = null;

    // Act/Assert
    expect(() => NumberTransform(input)).toThrowError(TransformError);
  });
});
