import { compareLogLevel } from "./LogLevel";

describe("LogLevel", () => {
  it("can compare log levels", () => {
    expect(compareLogLevel("info", "info")).toBe(0);
    expect(compareLogLevel("debug", "error")).toBe(-3);
    expect(compareLogLevel("error", "debug")).toBe(3);
  });
});
