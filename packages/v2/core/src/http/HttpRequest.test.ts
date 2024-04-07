import { HttpRequest, HttpMethod } from "./HttpRequest";
import { HttpHeaders, PlainHttpHeaders } from "./HttpHeaders";

describe("HttpRequest", () => {
  it("should set method in constructor", () => {
    const method: HttpMethod = "get";
    const request = new HttpRequest(method);
    expect(request["_method"]).toBe(method);
  });

  it("should set URL using withUrl method", () => {
    const request = new HttpRequest("get");
    const url = "https://example.com";
    request.withUrl(url);
    expect(request["_url"]).toBe(url);
  });

  it("should set body using withBody method", () => {
    const request = new HttpRequest("get");
    const body = JSON.stringify({ key: "value" });
    request.withBody(body);
    expect(request["_body"]).toBe(body);
  });

  it("should add headers using withHeaders method with PlainHttpHeaders", () => {
    const request = new HttpRequest("get");
    const headers = { "Content-Type": "application/json" } as PlainHttpHeaders;
    request.withHeaders(headers);
    expect(request["_headers"]).toContainEqual(headers);
  });

  it("should add headers using withHeaders method with HttpHeaders", () => {
    const request = new HttpRequest("get");
    const headers = new HttpHeaders();
    headers.add("Authorization", "Bearer token");
    request.withHeaders(headers);
    expect(request["_headers"]).toContainEqual(headers.toPlain());
  });

  it("should add headers using withHeaders method with builder function", () => {
    const request = new HttpRequest("get");
    request.withHeaders((headers) => {
      headers.add("Authorization", "Bearer token");
      headers.add("Content-Type", "application/json");
    });
    const expectedHeaders = {
      Authorization: "Bearer token",
      "Content-Type": "application/json",
    };
    expect(request["_headers"]).toContainEqual(expectedHeaders);
  });

  it("should convert request to plain object using toPlain method", () => {
    const method: HttpMethod = "get";
    const url = "https://example.com";
    const body = JSON.stringify({ key: "value" });
    const headers = { "Content-Type": "application/json" } as PlainHttpHeaders;
    const request = new HttpRequest(method);
    request.withUrl(url).withBody(body).withHeaders(headers);
    const plainRequest = request.toPlain();
    expect(plainRequest).toEqual({
      method,
      url,
      body,
      headers,
    });
  });
});
