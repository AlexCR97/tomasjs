import { greet } from "@/utils/greet";
import { describe, expect, it } from "@jest/globals";

describe("@thomas/test", () => {
  it("ThomasJS tests work", () => {
    const message = greet("ThomasJS");
    expect(message).toEqual("Hello ThomasJS!");
  });
});
