import "reflect-metadata";
import { ContainerBuilder } from "@/dependency-injection";
import { ConfigurationSetup, configurationToken } from "./ConfigurationSetup";
import { Configuration } from "./Configuration";

describe("ConfigurationSetup", () => {
  it("Can setup Configuration", async () => {
    const services = await new ContainerBuilder()
      .setup(new ConfigurationSetup().build())
      .buildServiceProvider();

    const configuration = services.getOrThrow<Configuration>(configurationToken);
    expect(configuration).toBeInstanceOf(Configuration);
  });

  it("Can setup Configuration with raw source", async () => {
    const rawSource = {
      a: true,
      b: 99,
      c: "foo!",
    } as const;

    const services = await new ContainerBuilder()
      .setup(new ConfigurationSetup().addRawSource(rawSource).build())
      .buildServiceProvider();

    const configuration = services.getOrThrow<Configuration>(configurationToken);

    const configurationRootValue = configuration.valueOrThrow<typeof rawSource>("object");

    expect(configurationRootValue).toMatchObject(rawSource);
  });

  it("Can setup Configuration with environment source", async () => {
    const services = await new ContainerBuilder()
      .setup(new ConfigurationSetup().addEnvironmentSource().build())
      .buildServiceProvider();

    const configuration = services.getOrThrow<Configuration>(configurationToken);

    const configurationRootValue = configuration.valueOrThrow("object");

    expect(configurationRootValue).toMatchObject(process.env);
  });

  it("Can setup Configuration with json source", async () => {
    const services = await new ContainerBuilder()
      .setup(new ConfigurationSetup().addJsonSource("./appconfig.test.json").build())
      .buildServiceProvider();

    const configuration = services.getOrThrow<Configuration>(configurationToken);

    const configurationRootValue = configuration.valueOrThrow("object");

    expect(configurationRootValue).toMatchObject({
      booleanTrue: true,
      booleanFalse: false,
      booleanTrueString: "true",
      booleanFalseString: "false",
      number: 99,
      numberString: "99",
      string: "it works!",
      object: {
        foo: {
          bar: "buzz",
        },
      },
    });
  });

  it("Can setup Configuration with multiple sources", async () => {
    const jsonSource = {
      booleanTrue: true,
      booleanFalse: false,
      booleanTrueString: "true",
      booleanFalseString: "false",
      number: 99,
      numberString: "99",
      string: "it works!",
      object: {
        foo: {
          bar: "buzz",
        },
      },
    } as const;

    const rawSource = {
      a: true,
      b: 99,
      c: "foo!",
    } as const;

    const services = await new ContainerBuilder()
      .setup(
        new ConfigurationSetup()
          .addEnvironmentSource()
          .addJsonSource("./appconfig.test.json")
          .addRawSource(rawSource)
          .build()
      )
      .buildServiceProvider();

    const configuration = services.getOrThrow<Configuration>(configurationToken);

    const configurationRootValue = configuration.valueOrThrow("object");

    expect(configurationRootValue).toMatchObject({
      ...process.env,
      ...jsonSource,
      ...rawSource,
    });
  });
});
