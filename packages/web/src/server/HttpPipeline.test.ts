import { HttpClient } from "@tomasjs/core/http";
import { HttpServer } from "./HttpServer";
import { IterativeHttpPipeline, RecursiveHttpPipeline } from "./HttpPipeline";
import { benchmark } from "@/test/benchmark";
import { testHttpServer } from "@/test";

describe.skip("HttpPipeline", () => {
  const client = new HttpClient();
  const middlewareCount = 100;
  const iterations = 500;

  it("`should benchmark HttpPipeline", async () => {
    const recursiveServer = await buildHttpServer("recursive");
    const iterativeServer = await buildHttpServer("iterative");

    await recursiveServer.start();
    await iterativeServer.start();

    const results = await benchmark({
      iterations,
      functions: [
        {
          name: RecursiveHttpPipeline.name,
          func: async () => {
            await client.get(`http://localhost:${recursiveServer.port}`);
          },
        },
        {
          name: IterativeHttpPipeline.name,
          func: async () => {
            await client.get(`http://localhost:${iterativeServer.port}`);
          },
        },
      ],
    });

    await recursiveServer.stop();
    await iterativeServer.stop();

    let breakpoint = "stop here";
  });

  async function buildHttpServer(pipelineMode: "recursive" | "iterative"): Promise<HttpServer> {
    const server = await testHttpServer();

    for (let i = 0; i < middlewareCount; i++) {
      server.use(async (req, res, next) => await next());
    }

    return server;
  }
});
