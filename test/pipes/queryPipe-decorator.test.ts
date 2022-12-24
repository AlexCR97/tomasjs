import "reflect-metadata";
import { describe, it } from "@jest/globals";
import { queryPipe } from "../../src/pipes";
import { Endpoint } from "../../src/endpoints";
import { HttpContext } from "../../src/core";
import { NumberTransform } from "../../src/transforms";

describe("queryPipe-decorator", () => {
  it(`The ${queryPipe.name} decorator can successfully apply the ${NumberTransform.name}`, async () => {
    // Arrange
    const query = "099";
    const queryKey = "pageSize";
    const expectedQuery = 99;

    class TestEndpoint implements Endpoint {
      @queryPipe(queryKey, NumberTransform)
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
