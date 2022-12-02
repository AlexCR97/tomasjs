import { describe, expect, it } from "@jest/globals";
import { greet } from "./greeter";

describe("Sample Test", () => {
  it("Tests work", () => {
    const message = greet("ThomasJS");
    expect(message).toEqual("Hello ThomasJS!");
  });
});
