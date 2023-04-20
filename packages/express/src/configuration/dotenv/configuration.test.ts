import "reflect-metadata";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../../test/utils/server";
import { DotenvConfiguration, DotenvSetup } from ".
import { internalContainer } from "../../src/container";
import { ConfigurationResolver, ConfigurationToken } from "../../src/configuration/core";

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
      path: "C:\\Projects\\thomas\\test\\configuration\\.env",
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
    containerSetup(internalContainer);

    const configuration = ConfigurationResolver.getConfiguration<AppSettings>();

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
