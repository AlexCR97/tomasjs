import "reflect-metadata";
import { it, describe, expect } from "@jest/globals";
import { set } from "./set";

describe("reflection/set", () => {
  it("Can set a value from a simple object", () => {
    const x = {
      a: undefined,
    };

    set(x, "a", 1);
    expect(x.a).toBe(1);
  });

  it("Can set a value from a nested object", () => {
    const x = {
      a: {
        b: {
          c: undefined,
        },
      },
    };

    set(x, "a.b.c", 1);
    expect(x.a.b.c).toBe(1);
  });

  it("Can set a value from a nested object using a custom notation", () => {
    const x = {
      a: {
        b: {
          c: 1,
        },
      },
    };

    set(x, "a__b__c", 1, { notation: "__" });
    expect(x.a.b.c).toBe(1);
  });
});
