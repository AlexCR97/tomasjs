import { UrlParser } from "./UrlParser";

describe("UrlParser", () => {
  const pattern = "/tenants/:tenantId/users/:userId/organizations";
  const url = "/tenants/1/users/2/organizations?offset=10&limit=25";
  const urlParser = new UrlParser(url);

  it("should get path", () => {
    const path = urlParser.path();
    expect(path).toMatch("/tenants/1/users/2/organizations");
  });

  it("should get query params", () => {
    const queryParams = urlParser.queryParams();
    expect(queryParams.firstOrThrow("offset")).toMatch("10");
    expect(queryParams.firstOrThrow("limit")).toMatch("25");
  });

  it("should get route params", () => {
    const routeParams = urlParser.routeParams(pattern);
    expect(routeParams.getOrThrow("tenantId")).toMatch("1");
    expect(routeParams.getOrThrow("userId")).toMatch("2");
  });

  it("should match path", () => {
    const matches = urlParser.matches(pattern);
    expect(matches).toBe(true);
  });

  it("should not match path", () => {
    const matches = urlParser.matches("/path/to/resource");
    expect(matches).toBe(false);
  });
});
