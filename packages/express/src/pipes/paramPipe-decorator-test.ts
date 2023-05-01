import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import { paramPipe } from "./@paramPipe";
import { Endpoint } from "../endpoints";
import { HttpContext } from "../core";
import { numberTransform } from "@tomasjs/core";

describe("paramPipe-decorator", () => {
  it(`The ${paramPipe.name} decorator can successfully apply the ${numberTransform.name}`, async () => {
    // Arrange
    const param = "1";
    const expectedParam = 1;

    class TestEndpoint implements Endpoint {
      //@ts-ignore: Fix decorators not working in test files
      @paramPipe("id", numberTransform)
      handle(context: HttpContext) {
        return context.request.params.id;
      }
    }

    const context = fakeHttpContext();
    context.request.params.id = param;

    // Act
    const endpoint = new TestEndpoint();
    const response = endpoint.handle(context);

    // Assert
    expect(typeof response).toBe("number");
    expect(response).toBe(expectedParam);
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
