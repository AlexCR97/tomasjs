import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { tryCloseServerAsync } from "../../tests/utils";
import { DotenvConfiguration } from "./DotenvConfiguration";
import { DotenvSetup } from "./DotenvSetup";
import { ConfigurationResolver, ConfigurationToken, globalContainer } from "@tomasjs/core";

describe("configuration", () => {
  let server: any; // TODO Set http.Server type

  beforeEach(async () => {
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tryCloseServerAsync(server);
  });

  it(`The ${DotenvConfiguration.name} loads a .env file into the ${ConfigurationToken} token`, () => {
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

    const dotenvSetup = new DotenvSetup<AppSettings>({
      path: "C:\\Projects\\thomas\\packages\\express\\src\\configuration\\dotenv\\.env",
      constructor: AppSettings,
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
    });

    const containerSetup = dotenvSetup.create();
    containerSetup(globalContainer);

    const configuration = new ConfigurationResolver().getConfiguration<AppSettings>();

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
