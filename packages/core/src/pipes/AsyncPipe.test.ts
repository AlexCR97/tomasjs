import "reflect-metadata";
import { it, describe, expect } from "@jest/globals";
import { AsyncPipe } from "./AsyncPipe";
import { AsyncTransform, AsyncTransformFactory, AsyncTransformFunction } from "@/transforms";

describe("pipes-AsyncPipe", () => {
  it("Can pipe an async value", async () => {
    const messageFromAnonymousFunction = "Anonymous AsyncTransformFunction";
    const messageFromNamedFunction = "Named AsyncTransformFunction";
    const messageFromInstance = "AsyncTransform Instance";
    const messageFromFactory = "AsyncTransformFactory";

    const namedTransformFunction: AsyncTransformFunction<any, any> = (input) => {
      return { ...input, messageFromNamedFunction };
    };

    class MyTransform implements AsyncTransform<any, any> {
      transform(input: any) {
        return { ...input, messageFromInstance };
      }
    }

    class MyTransformFactory implements AsyncTransformFactory<any, any> {
      constructor(private readonly message: string) {}

      create(): AsyncTransformFunction<any, any> | AsyncTransform<any, any> {
        return (input) => ({ ...input, messageFromFactory: this.message });
      }
    }

    const original = {};

    const output = await AsyncPipe.promise(original)
      .then((pipe) => pipe.apply(async (input) => ({ ...input, messageFromAnonymousFunction })))
      .then((pipe) => pipe.apply(namedTransformFunction))
      .then((pipe) => pipe.apply(new MyTransform()))
      .then((pipe) => pipe.apply(new MyTransformFactory(messageFromFactory)))
      .then((pipe) => pipe.get());

    expect(Object.keys(original).length).toBe(0);
    expect(output.messageFromAnonymousFunction).toBe(messageFromAnonymousFunction);
    expect(output.messageFromNamedFunction).toBe(messageFromNamedFunction);
    expect(output.messageFromInstance).toBe(messageFromInstance);
    expect(output.messageFromFactory).toBe(messageFromFactory);
  });
});
