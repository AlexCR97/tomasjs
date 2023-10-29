import "reflect-metadata";
import { greeter } from "@/proto/greeter";
import { Server, credentials } from "@grpc/grpc-js";
import { describe, expect, it } from "@jest/globals";
import { ServiceContainer, TomasLogger } from "@tomasjs/core";
import { AppBuilder } from "./AppBuilder";
import { GreeterService } from "@/tests";

const testSuiteName = "builder/UseService";

describe(testSuiteName, () => {
  let server: Server | undefined;
  let logger = new TomasLogger(testSuiteName, "error");
  let container = new ServiceContainer();

  afterEach(() => {
    server?.forceShutdown();
    container = new ServiceContainer();
  });

  it("Can register a service", async () => {
    const port = 50052;
    const address = `0.0.0.0:${port}`;

    server = await new AppBuilder({ address, container })
      .useService(GreeterService.definition, GreeterService)
      .buildAsync();

    const service = container.get(GreeterService);
    expect(service).toBeTruthy();
    expect(service).toBeInstanceOf(GreeterService);
    expect(service.greet).toBeTruthy();
    expect(typeof service.greet === "function").toBeTruthy();
  });

  it("Can use a service", async () => {
    const port = 50053;
    const address = `0.0.0.0:${port}`;

    server = await new AppBuilder({ address, container })
      .useService(GreeterService.definition, GreeterService)
      .buildAsync();
    logger.debug("server built");

    const client = new greeter.GreeterClient(`localhost:${port}`, credentials.createInsecure());
    logger.debug("client built");

    const response = await client.greet(new greeter.GreetRequest({ name: "TomasJS" }));
    logger.debug("response", response);
  });
});
