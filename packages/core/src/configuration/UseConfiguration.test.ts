import "reflect-metadata";
import { it, describe, expect } from "@jest/globals";
import { ServiceContainerBuilder } from "..";
import { UseConfiguration } from "./UseConfiguration";
import { configurationToken } from "./configurationToken";

describe("UseConfiguration", () => {
  it("Can bind a configuration object", async () => {
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

    const configuration = services.get<MyConfiguration>(configurationToken);

    expect(configuration).toBeTruthy();
    expect(typeof configuration.stringProp === "string").toBeTruthy();
    expect(typeof configuration.numberProp === "number").toBeTruthy();
    expect(typeof configuration.booleanProp === "boolean").toBeTruthy();
  });
});
