import { HttpHeaders } from "./HttpHeaders";

describe("HttpHeaders", () => {
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
    const foundHeader = headers.find("Authorization");
    expect(foundHeader).toEqual({ key: "Authorization", value: "Bearer token" });
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
