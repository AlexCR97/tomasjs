import "reflect-metadata";
import { describe, it } from "@jest/globals";
import { InstanceTransform, transformType } from "../../src/transforms";

describe("instance-transform", () => {
  it(`The ${InstanceTransform.name} transforms a simple pojo to a class instance`, async () => {
    // Arrange
    const getterOutput = "The getter was called!";
    const methodOutput = "The method was called!";

    class TestClass {
      key1!: number;
      key2!: string;
      get someGetter() {
        return getterOutput;
      }
      someMethod() {
        return methodOutput;
      }
    }

    const input = {
      key1: 1,
      key2: "value2",
    };

    // Act
    const transformer = new InstanceTransform<TestClass>(TestClass);
    const output = await transformer.transform(input);

    // Assert
    expect(output.key1).toEqual(input.key1);
    expect(output.key2).toEqual(input.key2);
    expect(output.someGetter).toEqual(getterOutput);
    expect(output.someMethod()).toEqual(methodOutput);
    expect(output instanceof TestClass).toBeTruthy();
  });

  it(`The ${InstanceTransform.name} supports nesting when using the ${transformType.name} decorator`, async () => {
    // Arrange
    const getterOutput = "The getter was called!";
    const methodOutput = "The method was called!";

    class TestClass {
      key1!: number;
      key2!: string;

      @transformType(TestClass)
      child?: TestClass;

      get someGetter() {
        return getterOutput;
      }
      someMethod() {
        return methodOutput;
      }
    }

    const input = {
      key1: 1,
      key2: "value1",
      child: {
        key1: 2,
        key2: "value2",
        child: {
          key1: 3,
          key2: "value3",
          child: {
            key1: 4,
            key2: "value4",
          },
        },
      },
    };

    // Act
    const transformer = new InstanceTransform<TestClass>(TestClass);
    const output = await transformer.transform(input);

    console.log("input", input);
    console.log("output", output);

    // Assert
    let currentOutput: TestClass | undefined = output;
    let currentInput: any = input;

    while (currentOutput !== undefined) {
      expect(currentOutput.key1).toEqual(currentInput.key1);
      expect(currentOutput.key2).toEqual(currentInput.key2);
      expect(currentOutput.someGetter).toEqual(getterOutput);
      expect(currentOutput.someMethod()).toEqual(methodOutput);
      expect(currentOutput instanceof TestClass).toBeTruthy();

      currentOutput = currentOutput.child;
      currentInput = currentInput.child;
    }
  });
});
