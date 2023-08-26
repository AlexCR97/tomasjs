import "reflect-metadata";
import { it, describe, expect } from "@jest/globals";
import { Pipe } from "./Pipe";

describe("Pipe", () => {
  it("Can pipe a value", () => {
    const original = {};

    const result = new Pipe(original)
      .apply((obj) => ({ ...obj, prev: obj, message1: "message 1" }))
      .apply((obj) => ({ ...obj, prev: obj, message2: "message 2" }))
      .apply((obj) => ({ ...obj, prev: obj, message3: "message 3" }))
      .get();

    expect(Object.keys(original).length).toBe(0);
    expect(result.message1).toBe("message 1");
    expect(result.message2).toBe("message 2");
    expect(result.message3).toBe("message 3");
  });
});
