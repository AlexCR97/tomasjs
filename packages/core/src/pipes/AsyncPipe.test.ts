import "reflect-metadata";
import { it, describe, expect } from "@jest/globals";
import { AsyncPipe } from "./AsyncPipe";

describe("pipes-AsyncPipe", () => {
  it("Can pipe an async value", async () => {
    const original = {};

    const result = await AsyncPipe.promise(original)
      .then((pipe) => pipe.apply(async (obj) => ({ ...obj, prev: obj, message1: "message 1" })))
      .then((pipe) => pipe.apply(async (obj) => ({ ...obj, prev: obj, message2: "message 2" })))
      .then((pipe) => pipe.apply(async (obj) => ({ ...obj, prev: obj, message3: "message 3" })))
      .then((pipe) => pipe.get());

    expect(Object.keys(original).length).toBe(0);
    expect(result.message1).toBe("message 1");
    expect(result.message2).toBe("message 2");
    expect(result.message3).toBe("message 3");
  });
});
