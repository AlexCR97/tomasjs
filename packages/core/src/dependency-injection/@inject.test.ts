import "reflect-metadata";
import { InjectDecoratorMetadata, inject } from "./@inject";

describe("@inject", () => {
  it("Can get constructors arguments metadata", () => {
    class ClassB {}

    class ClassC {}

    class ClassA {
      constructor(@inject(ClassB) classB: ClassB, @inject(ClassC) classC: ClassC) {}
    }

    const param0Metadata = new InjectDecoratorMetadata(ClassA, 0).value;
    expect(param0Metadata.paramIndex).toBe(0);
    expect(param0Metadata.token).toBe(ClassB);

    const param1Metadata = new InjectDecoratorMetadata(ClassA, 1).value;
    expect(param1Metadata.paramIndex).toBe(1);
    expect(param1Metadata.token).toBe(ClassC);
  });
});
