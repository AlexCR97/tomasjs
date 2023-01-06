import "reflect-metadata";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../utils/server";
import { DotEnvSetup } from "../../src/configuration/dotenv";
import { internalContainer } from "../../src/container";
import { IConfiguration } from "../../src/configuration/core";

describe("configuration", () => {
  let server: any; // TODO Set http.Server type

  beforeEach(async () => {
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tryCloseServerAsync(server);
  });

  it("Test", () => {
    const key = "TOMASJS_FOO";
    // const value = "tomasjs";
    // process.env.TOMASJS_FOO = "tomasjs";
    console.log("process.env.TOMASJS_FOO", process.env[key]);
  });

  it("Test2", () => {
    interface AppSettings {
      string: string;
      "string.subkey": string;
      string_subkey: string;
      string__subkey: string;
      number: number;
      boolean_true: boolean;
      boolean_false: boolean;
    }

    const dotEnvSetup = new DotEnvSetup<AppSettings>({
      path: "C:\\Projects\\thomas\\test\\configuration\\.env",
      keyConfigurations: [
        {
          key: "number",
          type: "number",
        },
        {
          key: "boolean_true",
          type: "boolean",
        },
        {
          key: "boolean_false",
          type: "boolean",
        },
      ],
    });

    const containerSetup = dotEnvSetup.create();
    containerSetup(internalContainer);

    const registeredConfiguration =
      internalContainer.get<IConfiguration<AppSettings>>("IConfiguration");
    console.log("registeredConfiguration", registeredConfiguration);
    console.log(
      "registeredConfiguration.root.boolean_false",
      registeredConfiguration.root.boolean_false
    );
  });
});
