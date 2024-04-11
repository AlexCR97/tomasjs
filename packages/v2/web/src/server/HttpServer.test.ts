import { HttpClient } from "@tomasjs/core/http";
import { HttpServer } from "./HttpServer";
import { EndpointResponse, PlainTextContent, statusCodes } from "@/response";

describe("Server", () => {
  const client = new HttpClient();

  describe("start", () => {
    it("should accept connections", async () => {
      const port = 8080;

      const server = await new HttpServer({ port })
        .map("get", "/", () => new EndpointResponse({ status: statusCodes.ok }))
        .start();

      const response = await client.get(`http://localhost:${port}`);

      expect(response.ok).toBe(true);

      await server.stop();
    });

    it("should route requests", async () => {
      const port = 8081;

      const server = await new HttpServer({ port })
        .map("get", "/path/to/resource", async () => {
          return new EndpointResponse({
            status: statusCodes.ok,
            content: new PlainTextContent("Hooray!"),
          });
        })
        .start();

      const response = await client.get(`http://localhost:${port}/path/to/resource`);

      expect(response.ok).toBe(true);

      const responseText = await response.text();

      expect(responseText).toMatch("Hooray!");

      await server.stop();
    });
  });
});
