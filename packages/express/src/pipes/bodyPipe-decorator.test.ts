import "reflect-metadata";
import { describe, it } from "@jest/globals";
import { bodyPipe } from ".";
import { Endpoint } from "../endpoints";
import { HttpContext } from "../core";
import { InstanceTransform } from "../transforms";

describe("bodyPipe-decorator", () => {
  it(`The ${bodyPipe.name} decorator can successfully apply the ${InstanceTransform.name}`, async () => {
    // Arrange
    class TestClass {
      userId!: number;
      email!: string;
    }

    class TestEndpoint implements Endpoint {
      @bodyPipe(new InstanceTransform(TestClass))
      handle(context: HttpContext): TestClass {
        return context.request.body;
      }
    }

    const testBody: TestClass = {
      userId: 19,
      email: "sample@domain.com",
    };

    const context = fakeHttpContext();
    Reflect.set(context.request, "body", testBody);

    // Act
    const endpoint = new TestEndpoint();
    const response = endpoint.handle(context);

    // Assert
    expect(response).toBeTruthy();
    expect(response.userId).toBe(testBody.userId);
    expect(response.email).toEqual(testBody.email);
    expect(response instanceof TestClass).toBeTruthy();
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
