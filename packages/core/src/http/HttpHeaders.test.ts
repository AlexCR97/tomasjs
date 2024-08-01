import {
  HttpHeader,
  HttpHeaders,
  HttpHeaderValue,
  IHttpHeaders,
  isHttpHeader,
  isHttpHeaderValue,
  isIHttpHeaders,
  isPlainHttpHeaders,
  PlainHttpHeaders,
} from "./HttpHeaders";

describe("HttpHeaders", () => {
  it("should infer correct types", () => {
    const httpHeader: HttpHeader = { key: "x-foo", value: "bar" };

    const httpHeaderValueStr: HttpHeaderValue = "fizz";
    const httpHeaderValueArr: HttpHeaderValue = ["buzz"];

    const plainHttpHeaders: PlainHttpHeaders = {
      "x-foo": "bar",
      "x-fizz": ["buzz"],
    };

    const iHttpHeaders: IHttpHeaders = new HttpHeaders();

    type TestCase = {
      input: unknown;
      isHttpHeader: boolean;
      isHttpHeaderValue: boolean;
      isPlainHttpHeaders: boolean;
      isIHttpHeaders: boolean;
    };

    const testCases: TestCase[] = [
      {
        input: httpHeader,
        isHttpHeader: true,
        isHttpHeaderValue: false,
        isPlainHttpHeaders: true,
        isIHttpHeaders: false,
      },
      {
        input: httpHeaderValueStr,
        isHttpHeader: false,
        isHttpHeaderValue: true,
        isPlainHttpHeaders: false,
        isIHttpHeaders: false,
      },
      {
        input: httpHeaderValueArr,
        isHttpHeader: false,
        isHttpHeaderValue: true,
        isPlainHttpHeaders: false,
        isIHttpHeaders: false,
      },
      {
        input: plainHttpHeaders,
        isHttpHeader: false,
        isHttpHeaderValue: false,
        isPlainHttpHeaders: true,
        isIHttpHeaders: false,
      },
      {
        input: iHttpHeaders,
        isHttpHeader: false,
        isHttpHeaderValue: false,
        isPlainHttpHeaders: true,
        isIHttpHeaders: true,
      },
    ] as const;

    for (const testCase of testCases) {
      const isHttpHeaderResult = isHttpHeader(testCase.input);
      expect(isHttpHeaderResult).toBe(testCase.isHttpHeader);

      const isHttpHeaderValueResult = isHttpHeaderValue(testCase.input);
      expect(isHttpHeaderValueResult).toBe(testCase.isHttpHeaderValue);

      const isPlainHttpHeadersResult = isPlainHttpHeaders(testCase.input);
      expect(isPlainHttpHeadersResult).toBe(testCase.isPlainHttpHeaders);

      const isIHttpHeadersResult = isIHttpHeaders(testCase.input);
      expect(isIHttpHeadersResult).toBe(testCase.isIHttpHeaders);
    }
  });

  it("should add a single header", () => {
    const headers = new HttpHeaders();
    headers.add("Authorization", "Bearer token");
    expect(headers.includes("Authorization")).toBe(true);
  });

  it("should add multiple headers", () => {
    const headers = new HttpHeaders();
    headers.add([
      { key: "Authorization", value: "Bearer token" },
      { key: "Content-Type", value: "application/json" },
    ]);
    expect(headers.includes("Authorization")).toBe(true);
    expect(headers.includes("Content-Type")).toBe(true);
  });

  it("should find a header", () => {
    const headers = new HttpHeaders();
    headers.add("Authorization", "Bearer token");

    const foundHeaderWithExactCase = headers.find("Authorization");
    expect(foundHeaderWithExactCase).toMatch("Bearer token");

    const foundHeaderWithUppercase = headers.find("AUTHORIZATION");
    expect(foundHeaderWithUppercase).toEqual("Bearer token");

    const foundHeaderWithLowercase = headers.find("authorization");
    expect(foundHeaderWithLowercase).toEqual("Bearer token");
  });

  it("should return null when finding a non-existent header", () => {
    const headers = new HttpHeaders();
    const foundHeader = headers.find("Authorization");
    expect(foundHeader).toBeNull();
  });

  it("should remove a header", () => {
    const headers = new HttpHeaders();
    headers.add("Authorization", "Bearer token");
    headers.remove("Authorization");
    expect(headers.includes("Authorization")).toBe(false);
  });

  it("should convert headers to plain object", () => {
    const headers = new HttpHeaders();
    headers.add("Authorization", "Bearer token");
    headers.add("Content-Type", "application/json");
    const plainHeaders = headers.toPlain();
    expect(plainHeaders).toEqual({
      Authorization: "Bearer token",
      "Content-Type": "application/json",
    });
  });
});
