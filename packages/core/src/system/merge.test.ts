import { merge } from "./merge";

describe("merge", () => {
  it("Should merge multiple objects into a single object", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { c: 3 };
    const obj3 = { d: 4, e: 5 };

    const mergedObj = merge([obj1, obj2, obj3]);

    expect(mergedObj).toEqual({ a: 1, b: 2, c: 3, d: 4, e: 5 });
  });

  it("Should handle empty objects", () => {
    const mergedObj = merge([]);

    expect(mergedObj).toEqual({});
  });

  it("Should handle objects with overlapping keys", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 3, c: 4 };

    const mergedObj = merge([obj1, obj2]);

    expect(mergedObj).toEqual({ a: 1, b: 3, c: 4 });
  });

  it("Should handle objects with non-string keys", () => {
    const obj1 = { 1: "one", 2: "two" };
    const obj2 = { 3: "three" };

    const mergedObj = merge([obj1, obj2]);

    expect(mergedObj).toEqual({ 1: "one", 2: "two", 3: "three" });
  });
});
