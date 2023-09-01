import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import { controller } from "./@controller";
import { http, httpPost } from "./@http";
import { HttpMethodMetadata } from "./metadata";
import { HttpMethod } from "@/core";

const testSuiteName = "controllers/@http";

describe(testSuiteName, () => {
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

    @controller()
    class TestController {
      @http(expectedGetMethod.method, expectedGetMethod.path)
      getMethod() {}

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
