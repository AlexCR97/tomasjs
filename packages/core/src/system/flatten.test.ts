import { flatten } from "./flatten";

describe("flatten", () => {
  it("Should flatten an array of arrays", () => {
    const inputArray = [[1, 2, [3]], 4, [5, [6, 7]]];
    const expectedOutput = [1, 2, 3, 4, 5, 6, 7];
    const flattenedArray = flatten(inputArray);
    expect(flattenedArray).toEqual(expectedOutput);
  });

  it("Should handle empty arrays", () => {
    const inputArray: any[] = [];
    const flattenedArray = flatten(inputArray);
    expect(flattenedArray).toEqual([]);
  });

  it("Should handle arrays with non-array elements", () => {
    const inputArray = [1, 2, 3];
    const flattenedArray = flatten(inputArray);
    expect(flattenedArray).toEqual([1, 2, 3]);
  });

  it("Should handle arrays with mixed types of elements", () => {
    const inputArray = [1, [2, "hello"], ["world", 4], true, [false]];
    const flattenedArray = flatten(inputArray);
    expect(flattenedArray).toEqual([1, 2, "hello", "world", 4, true, false]);
  });
});
