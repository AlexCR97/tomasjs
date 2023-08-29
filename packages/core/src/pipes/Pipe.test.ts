import "reflect-metadata";
import { it, describe, expect } from "@jest/globals";
import { Pipe } from "./Pipe";
import { Transform, TransformFactory, TransformFunction } from "@/transforms";

describe("pipes-Pipe", () => {
  it("Can pipe a value", () => {
    const messageFromAnonymousFunction = "Anonymous TransformFunction";
    const messageFromNamedFunction = "Named TransformFunction";
    const messageFromInstance = "Transform Instance";
    const messageFromFactory = "TransformFactory";

    const namedTransformFunction: TransformFunction<any, any> = (input) => {
      return { ...input, messageFromNamedFunction };
    };

    class MyTransform implements Transform<any, any> {
      transform(input: any) {
        return { ...input, messageFromInstance };
      }
    }

    class MyTransformFactory implements TransformFactory<any, any> {
      constructor(private readonly message: string) {}

      create(): TransformFunction<any, any> | Transform<any, any> {
        return (input) => ({ ...input, messageFromFactory: this.message });
      }
    }

    const original = {};

    const output = new Pipe(original)
      .apply((input) => ({ ...input, messageFromAnonymousFunction }))
      .apply(namedTransformFunction)
      .apply(new MyTransform())
      .apply(new MyTransformFactory(messageFromFactory))
      .get();

    expect(Object.keys(original).length).toBe(0);
    expect(output.messageFromAnonymousFunction).toBe(messageFromAnonymousFunction);
    expect(output.messageFromNamedFunction).toBe(messageFromNamedFunction);
    expect(output.messageFromInstance).toBe(messageFromInstance);
    expect(output.messageFromFactory).toBe(messageFromFactory);
  });
});
