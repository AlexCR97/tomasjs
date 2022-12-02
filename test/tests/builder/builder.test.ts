import { describe, expect, it } from "@jest/globals";
import { AppBuilder } from "@thomas/builder";

describe("AppBuilder", () => {
  it("ThomasJS tests work", () => {
    const app = new AppBuilder();
    expect(app).toBeTruthy();
  });
});
