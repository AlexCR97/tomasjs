import { dot } from "./dot";

describe("dot", () => {
  it("Can get the value of an object", () => {
    const obj = {
      a: {
        b: {
          c: "hooray!",
        },
      },
    } as const;

    const c = dot(obj, "a.b.c");
    expect(c).toBe(obj.a.b.c);
  });
});
