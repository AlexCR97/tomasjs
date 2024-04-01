import { ContainerBuilder } from "@/dependency-injection/Container";
import { configurationToken } from "./ConfigurationSetup";
import { Configuration } from "./Configuration";

describe("ConfigurationSetup", () => {
  it("Can setup Configuration", async () => {
    const services = await new ContainerBuilder().addConfiguration(() => {}).buildServiceProvider();

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
      .addConfiguration((c) => c.addRawSource(rawSource))
      .buildServiceProvider();

    const configuration = services.getOrThrow<Configuration>(configurationToken);

    const configurationRootValue = configuration.valueOrThrow<typeof rawSource>("object");

    expect(configurationRootValue).toMatchObject(rawSource);
  });

  it("Can setup Configuration with environment source", async () => {
    const services = await new ContainerBuilder()
      .addConfiguration((c) => c.addEnvironmentSource())
      .buildServiceProvider();

    const configuration = services.getOrThrow<Configuration>(configurationToken);

    const configurationRootValue = configuration.valueOrThrow("object");

    expect(configurationRootValue).toMatchObject(process.env);
  });

  it("Can setup Configuration with json source", async () => {
    const services = await new ContainerBuilder()
      .addConfiguration((c) => c.addJsonSource("./appconfig.test.json"))
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
      .addConfiguration((c) =>
        c.addEnvironmentSource().addJsonSource("./appconfig.test.json").addRawSource(rawSource)
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
