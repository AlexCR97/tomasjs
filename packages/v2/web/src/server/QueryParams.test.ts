import { ParsedUrlQuery } from "querystring";
import { QueryParams, QueryParamNotFoundError } from "./QueryParams";

describe("QueryParams", () => {
  const query: ParsedUrlQuery = {
    param1: "value1",
    param2: ["value2", "value3"],
    param3: undefined,
  };

  const queryParams = new QueryParams(query);

  it("should correctly initialize with query data", () => {
    expect(queryParams.keys).toEqual(["param1", "param2", "param3"]);
  });

  it("should return all values for a given key", () => {
    expect(queryParams.all("param1")).toEqual(["value1"]);
    expect(queryParams.all("param2")).toEqual(["value2", "value3"]);
    expect(queryParams.all("param3")).toEqual([]);
    expect(queryParams.all("nonexistent")).toEqual([]);
  });

  it("should return the first value for a given key", () => {
    expect(queryParams.first("param1")).toEqual("value1");
    expect(queryParams.first("param2")).toEqual("value2");
    expect(queryParams.first("param3")).toBeNull();
    expect(queryParams.first("nonexistent")).toBeNull();
  });

  it("should throw QueryParamNotFoundError when calling firstOrThrow with non-existent key", () => {
    expect(() => queryParams.firstOrThrow("nonexistent")).toThrow(QueryParamNotFoundError);
  });

  it("should return the value for a given key", () => {
    expect(queryParams.get("param1")).toEqual("value1");
    expect(queryParams.get("param2")).toEqual(["value2", "value3"]);
    expect(queryParams.get("param3")).toBeNull();
    expect(queryParams.get("nonexistent")).toBeNull();
  });

  it("should throw QueryParamNotFoundError when calling getOrThrow with non-existent key", () => {
    expect(() => queryParams.getOrThrow("nonexistent")).toThrow(QueryParamNotFoundError);
  });

  it("should return the query data in plain format", () => {
    expect(queryParams.toPlain()).toMatchObject({
      param1: "value1",
      param2: ["value2", "value3"],
      param3: null,
    });
  });
});
