import "reflect-metadata";
import { ContainerBuilder } from "@/dependency-injection/Container";
import { HttpClient } from "./HttpClient";

describe("HttpClientSetup", () => {
  it("should register an HttpClient", async () => {
    const token = "MyHttpClient" as const;

    const services = await new ContainerBuilder().addHttpClient(token).buildServiceProvider();

    const client = services.get<HttpClient>(token);

    expect(client).toBeInstanceOf(HttpClient);
  });
});
