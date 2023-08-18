import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import { DotenvConfiguration } from "./DotenvConfiguration";
import { UseDotenv } from "./UseDotenv";
import { Configuration, ConfigurationToken, ServiceContainerBuilder } from "@tomasjs/core";

describe("configuration-dotenv-UseDotenv", () => {
  it(`The ${DotenvConfiguration.name} loads a .env file into the ${ConfigurationToken} token`, async () => {
    const expectedStringKey = "This is a string";
    const expectedNumberKey = 99;
    const expectedBooleanTrueKey = true;
    const expectedBooleanFalseKey = false;

    class AppSettings {
      readonly stringKey!: string;
      readonly numberKey!: number;
      readonly booleanTrueKey!: boolean;
      readonly booleanFalseKey!: boolean;
    }

    const container = await new ServiceContainerBuilder()
      .setup(
        new UseDotenv({
          constructor: AppSettings,
          path: "C:\\Projects\\thomas\\packages\\express\\src\\configuration\\dotenv\\.env",
          keyConfigurations: [
            {
              key: "numberKey",
              type: "number",
            },
            {
              key: "booleanTrueKey",
              type: "boolean",
            },
            {
              key: "booleanFalseKey",
              type: "boolean",
            },
          ],
        })
      )
      .buildServiceProviderAsync();

    const configuration = container.get<Configuration<AppSettings>>(ConfigurationToken);

    expect(configuration).toBeTruthy();
    expect(configuration.root).toBeTruthy();

    expect(typeof configuration.root.stringKey).toBe("string");
    expect(configuration.root.stringKey).toEqual(expectedStringKey);

    expect(typeof configuration.root.numberKey).toBe("number");
    expect(configuration.root.numberKey).toBe(expectedNumberKey);

    expect(typeof configuration.root.booleanTrueKey).toBe("boolean");
    expect(configuration.root.booleanTrueKey).toBe(expectedBooleanTrueKey);

    expect(typeof configuration.root.booleanFalseKey).toBe("boolean");
    expect(configuration.root.booleanFalseKey).toBe(expectedBooleanFalseKey);
  });
});
