import "reflect-metadata";
import { it, describe, expect } from "@jest/globals";
import { getOrDefault } from "./get";

describe("reflection/get", () => {
  it("Can get a value from a simple object", () => {
    const x = {
      a: 1,
    };

    const value = getOrDefault<number>(x, "a");
    expect(value).toBe(x.a);
  });

  it("Can get a value from a nested object", () => {
    const x = {
      a: {
        b: {
          c: 1,
        },
      },
    };

    const value = getOrDefault<number>(x, "a.b.c");
    expect(value).toBe(x.a.b.c);
  });

  it("Can get a value from a nested object using a custom notation", () => {
    const x = {
      a: {
        b: {
          c: 1,
        },
      },
    };

    const value = getOrDefault<number>(x, "a__b__c", { notation: "__" });
    expect(value).toBe(x.a.b.c);
  });
});
