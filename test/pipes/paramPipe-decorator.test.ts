import "reflect-metadata";
import { describe, it } from "@jest/globals";
import { paramPipe } from "../../src/pipes";
import { Endpoint } from "../../src/endpoints";
import { HttpContext } from "../../src/core";
import { NumberTransform } from "../../src/transforms";

describe("paramPipe-decorator", () => {
  it(`The ${paramPipe.name} decorator can successfully apply the ${NumberTransform.name}`, async () => {
    // Arrange
    const param = "1";
    const expectedParam = 1;

    class TestEndpoint implements Endpoint {
      @paramPipe("id", NumberTransform)
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
