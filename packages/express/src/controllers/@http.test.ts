import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { controller } from "./@controller";
import { http, httpPost } from "./@http";
import { HttpMethodMetadata } from "./metadata";
import { HttpMethod } from "../core";

describe("controllers-httpDecorator", () => {
  beforeEach(async () => {});

  afterEach(async () => {});

  it("The @http decorators set the required metadata to the controller's methods", () => {
    interface ExpectedMethod {
      method: HttpMethod;
      path: string;
    }

    const expectedGetMethod: ExpectedMethod = {
      method: "get",
      path: "test",
    };

    const expectedPostMethod: ExpectedMethod = {
      method: "post",
      path: "foo",
    };

    //@ts-ignore: Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore: Fix decorators not working in test files
      @http(expectedGetMethod.method, expectedGetMethod.path)
      getMethod() {}

      //@ts-ignore: Fix decorators not working in test files
      @httpPost(expectedPostMethod.path)
      postMethod() {}
    }

    const testController = new TestController();
    const decoratedProperties = Reflect.getMetadataKeys(testController);

    // Assert (GET method)
    const getMethodKey = decoratedProperties.find((key) => key === "getMethod");
    expect(getMethodKey).toBeTruthy();

    const getMethodMetadata = new HttpMethodMetadata(testController, getMethodKey);
    expect(getMethodMetadata.httpMethod).toBe(expectedGetMethod.method);
    expect(getMethodMetadata.path).toBe(expectedGetMethod.path);

    // Assert (POST method)
    const postMethodKey = decoratedProperties.find((key) => key === "postMethod");
    expect(postMethodKey).toBeTruthy();

    const postMethodMetadata = new HttpMethodMetadata(testController, postMethodKey);
    expect(postMethodMetadata.httpMethod).toBe(expectedPostMethod.method);
    expect(postMethodMetadata.path).toBe(expectedPostMethod.path);
  });
});
