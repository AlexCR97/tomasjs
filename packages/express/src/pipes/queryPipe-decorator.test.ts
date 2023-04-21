import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import { queryPipe } from "./@queryPipe";
import { Endpoint } from "../endpoints";
import { HttpContext } from "../core";
import { numberTransform } from "@tomasjs/core";

describe("queryPipe-decorator", () => {
  it(`The ${queryPipe.name} decorator can successfully apply the ${numberTransform.name}`, async () => {
    // Arrange
    const query = "099";
    const queryKey = "pageSize";
    const expectedQuery = 99;

    class TestEndpoint implements Endpoint {
      //@ts-ignore: Fix decorators not working in test files
      @queryPipe(queryKey, numberTransform)
      handle(context: HttpContext) {
        return context.request.query[queryKey];
      }
    }

    const context = fakeHttpContext();
    context.request.query[queryKey] = query;

    // Act
    const endpoint = new TestEndpoint();
    const response = endpoint.handle(context);

    // Assert
    expect(typeof response).toBe("number");
    expect(response).toBe(expectedQuery);
  });
});

function fakeHttpContext(): HttpContext {
  const context = new HttpContext();
  context.request = {} as any;
  Reflect.set(context.request, "body", {});
  Reflect.set(context.request, "headers", {});
  Reflect.set(context.request, "params", {});
  Reflect.set(context.request, "query", {});
  return context;
}
