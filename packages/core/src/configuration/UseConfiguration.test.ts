import "reflect-metadata";
import { it, describe, expect } from "@jest/globals";
import { UseConfiguration } from "./UseConfiguration";
import { configurationToken } from "./configurationToken";
import { ServiceContainerBuilder, inject, injectable } from "@/container";
import { Configuration } from "./Configuration";

describe("UseConfiguration", () => {
  it("Can bind a configuration object from a .env source", async () => {
    interface MyConfiguration {
      stringProp: string;
      numberProp: number;
      booleanProp: boolean;
    }

    const services = await new ServiceContainerBuilder()
      .setup(
        new UseConfiguration<MyConfiguration>({
          keyConfigs: [
            {
              key: "stringProp",
              type: "string",
            },
            {
              key: "numberProp",
              type: "number",
            },
            {
              key: "booleanProp",
              type: "boolean",
            },
          ],
        })
      )
      .buildServiceProviderAsync();

    const configuration = services.get<Configuration<MyConfiguration>>(configurationToken);

    expect(configuration).toBeTruthy();
    expect(typeof configuration.stringProp === "string").toBeTruthy();
    expect(typeof configuration.numberProp === "number").toBeTruthy();
    expect(typeof configuration.booleanProp === "boolean").toBeTruthy();
  });

  it("Can bind a configuration object from a json source", async () => {
    interface MyConfiguration {
      stringProp: string;
      numberProp: number;
      booleanProp: boolean;
    }

    const services = await new ServiceContainerBuilder()
      .setup(
        new UseConfiguration<MyConfiguration>({
          source: "json",
        })
      )
      .buildServiceProviderAsync();

    const configuration = services.get<MyConfiguration>(configurationToken);

    expect(configuration).toBeTruthy();
    expect(typeof configuration.stringProp === "string").toBeTruthy();
    expect(typeof configuration.numberProp === "number").toBeTruthy();
    expect(typeof configuration.booleanProp === "boolean").toBeTruthy();
  });

  it("Can inject a configuration object", async () => {
    interface MyConfiguration {
      stringProp: string;
      numberProp: number;
      booleanProp: boolean;
    }

    @injectable()
    class MyService {
      constructor(@inject(configurationToken) readonly config: Configuration<MyConfiguration>) {}
    }

    const services = await new ServiceContainerBuilder()
      .addClass(MyService)
      .setup(
        new UseConfiguration<MyConfiguration>({
          source: "json",
        })
      )
      .buildServiceProviderAsync();

    const myService = services.get(MyService);
    const configuration = myService.config;

    expect(configuration).toBeTruthy();
    expect(typeof configuration.stringProp === "string").toBeTruthy();
    expect(typeof configuration.numberProp === "number").toBeTruthy();
    expect(typeof configuration.booleanProp === "boolean").toBeTruthy();
  });

  it("Can map environment variables into a .env configuration object", async () => {
    interface MyConfiguration {
      stringFromEnv: string;
      numberFromEnv: number;
      booleanFromEnv: boolean;
    }

    process.env.stringFromEnv = "A string value";
    process.env.numberFromEnv = "10";
    process.env.booleanFromEnv = "true";

    const services = await new ServiceContainerBuilder()
      .setup(
        new UseConfiguration<MyConfiguration>({
          keyConfigs: [
            {
              key: "stringFromEnv",
              type: "string",
              overrideFromEnvironment: true,
            },
            {
              key: "numberFromEnv",
              type: "number",
              overrideFromEnvironment: true,
            },
            {
              key: "booleanFromEnv",
              type: "boolean",
              overrideFromEnvironment: true,
            },
          ],
        })
      )
      .buildServiceProviderAsync();

    const configuration = services.get<Configuration<MyConfiguration>>(configurationToken);

    expect(configuration).toBeTruthy();
    expect(typeof configuration.stringFromEnv === "string").toBeTruthy();
    expect(typeof configuration.numberFromEnv === "number").toBeTruthy();
    expect(typeof configuration.booleanFromEnv === "boolean").toBeTruthy();

    process.env.stringFromEnv = undefined;
    process.env.numberFromEnv = undefined;
    process.env.booleanFromEnv = undefined;
  });
});
