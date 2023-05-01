import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { controller } from "./@controller";
import { ControllerMetadata } from "./metadata";

describe("controllers-controllerDecorator", () => {
  beforeEach(async () => {});

  afterEach(async () => {});

  it(`The @controller decorator sets the "path" metadata`, () => {
    const expectedPath = "test";

    //@ts-ignore: Fix decorators not working in test files
    @controller(expectedPath)
    class TestController {}

    const testController = new TestController();
    const metadata = new ControllerMetadata(testController);
    expect(metadata.path).toEqual(expectedPath);
  });
});
