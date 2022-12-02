import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import { AppBuilder } from "../../src/builder";

describe("AppBuilder", () => {
  it("AppBuilder works", () => {
    const app = new AppBuilder();
    expect(app).toBeTruthy();
  });
});
