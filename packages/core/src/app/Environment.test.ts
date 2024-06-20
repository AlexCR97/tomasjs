import { Environment } from "./Environment";

describe(Environment.name, () => {
  it("should build the current environment", () => {
    const env = Environment.current();
    expect(env.name).toBeTruthy();
    expect(env.host).toBeTruthy();
    expect(env.platform).toBeTruthy();
    expect(env.process).toBeTruthy();
    expect(env.rootPath).toBeTruthy();
  });
});
