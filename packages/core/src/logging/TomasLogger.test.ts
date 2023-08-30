import "reflect-metadata";
import { describe, it } from "@jest/globals";
import { TomasLogger } from "./TomasLogger";

describe("logging-TomasLogger", () => {
  it("Can create and use a TomasLogger", () => {
    const logger = new TomasLogger("test", "debug");
    logger.debug('This is a log with "debug" level.');
    logger.verbose('This is a log with "verbose" level.');
    logger.info('This is a log with "info" level.');
    logger.warn('This is a log with "warn" level.');
    logger.error('This is a log with "error" level.');
    console.log("");
  });

  it("Can log with data", () => {
    const logger = new TomasLogger("test", "debug");
    logger.debug("Log with number", 10);
    logger.debug("Log with boolean", true);
    logger.debug("Log with string", "TestString");
    logger.debug("Log with single object", { propA: "PropA", propB: "PropB" });
    logger.debug(
      "Log with multiple objects",
      { propA: "PropA", propB: "PropB" },
      { propC: "PropC", propD: "PropD" }
    );
    console.log("");
  });
});
