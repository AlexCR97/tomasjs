import { LogDataValueRegistry } from "./LogDataValueRegistry";

describe("logging/LogDataValueRegistry", () => {
  beforeEach(() => {
    LogDataValueRegistry.reset();
  });

  afterEach(() => {
    LogDataValueRegistry.reset();
  });

  it("can clear the registry", () => {
    LogDataValueRegistry.clear();
    expect(LogDataValueRegistry.count()).toBe(0);
  });

  it("can iterate over the registry", () => {
    let count = 0;
    LogDataValueRegistry.forEach(() => (count += 1));
    expect(LogDataValueRegistry.count()).toBe(count);
  });

  it("can iterate over the registry", () => {
    let count = 0;
    LogDataValueRegistry.forEach(() => (count += 1));
    expect(LogDataValueRegistry.count()).toBe(count);
  });
});
