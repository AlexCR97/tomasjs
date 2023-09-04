import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import { controller } from "./@controller";
import { ControllerMetadata } from "./metadata";

const testSuiteName = "controllers/@controller";

describe(testSuiteName, () => {
  it(`The @controller decorator sets the "path" metadata`, () => {
    const expectedPath = "test";

    @controller(expectedPath)
    class TestController {}

    const testController = new TestController();
    const metadata = new ControllerMetadata(testController);
    expect(metadata.path).toEqual(expectedPath);
  });
});
