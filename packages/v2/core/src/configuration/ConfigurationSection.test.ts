import { ConfigurationSection } from "./ConfigurationSection";
import { ConfigurationValueTypeError } from "./ConfigurationValueTypeError";
import { ConfigurationSectionError } from "./ConfigurationSectionError";

describe("ConfigurationSection", () => {
  const root = {
    foo: {
      bar: "buzz",
    },
  } as const;

  it("Can get section values", () => {
    const rootSection = new ConfigurationSection("", root);

    const rootSectionValue = rootSection.valueOrThrow<typeof root>("object");
    expect(rootSectionValue).toBe(root);

    const fooSection = rootSection.sectionOrThrow("foo");
    const fooSectionValue = fooSection.valueOrThrow("object");
    expect(fooSectionValue).toBe(root.foo);

    const barSectionFromFooSection = fooSection.sectionOrThrow("bar");
    const barSectionFromFooSectionValue = barSectionFromFooSection.valueOrThrow<string>("string");
    expect(barSectionFromFooSectionValue).toBe(root.foo.bar);

    const barSectionFromRootSection = rootSection.sectionOrThrow("foo.bar");
    const barSectionFromRootSectionValue = barSectionFromRootSection.valueOrThrow<string>("string");
    expect(barSectionFromRootSectionValue).toBe(root.foo.bar);

    expect(barSectionFromFooSectionValue).toBe(barSectionFromRootSectionValue);
  });

  it("Cannot get non-existing sections gracefully", () => {
    const rootSection = new ConfigurationSection("", root);

    const bazSection = rootSection.section("baz");
    expect(bazSection).toBeNull();
  });

  it("Cannot get non-existing sections with error", () => {
    const rootSection = new ConfigurationSection("", root);

    try {
      rootSection.section("baz");
    } catch (err) {
      expect(err).toBeInstanceOf(ConfigurationSectionError);
    }
  });

  it("Can get typed values", () => {
    const root = {
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

    const rootSection = new ConfigurationSection("", root);
    expect(rootSection.sectionOrThrow("booleanTrue").valueOrThrow("boolean")).toBe(true);
    expect(rootSection.sectionOrThrow("booleanFalse").valueOrThrow("boolean")).toBe(false);
    expect(rootSection.sectionOrThrow("booleanTrueString").valueOrThrow("boolean")).toBe(true);
    expect(rootSection.sectionOrThrow("booleanFalseString").valueOrThrow("boolean")).toBe(false);
    expect(rootSection.sectionOrThrow("number").valueOrThrow("number")).toBe(99);
    expect(rootSection.sectionOrThrow("numberString").valueOrThrow("number")).toBe(99);
    expect(rootSection.sectionOrThrow("string").valueOrThrow("string")).toMatch("it works!");
    expect(rootSection.sectionOrThrow("object").valueOrThrow("object")).toMatchObject({
      foo: {
        bar: "buzz",
      },
    });
  });

  it("Can fail to convert types gracefully", () => {
    const root = {
      boolean: true,
      number: 99,
      string: "it works!",
      object: {
        foo: {
          bar: "buzz",
        },
      },
    } as const;

    const rootSection = new ConfigurationSection("", root);

    try {
      rootSection.sectionOrThrow("boolean").valueOrThrow("string");
    } catch (err) {
      expect(err).toBeInstanceOf(ConfigurationValueTypeError);
    }

    try {
      rootSection.sectionOrThrow("number").valueOrThrow("boolean");
    } catch (err) {
      expect(err).toBeInstanceOf(ConfigurationValueTypeError);
    }

    try {
      rootSection.sectionOrThrow("string").valueOrThrow("object");
    } catch (err) {
      expect(err).toBeInstanceOf(ConfigurationValueTypeError);
    }

    try {
      rootSection.sectionOrThrow("object").valueOrThrow("string");
    } catch (err) {
      expect(err).toBeInstanceOf(ConfigurationValueTypeError);
    }
  });
});
