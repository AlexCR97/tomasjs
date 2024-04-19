import { HttpClient } from "@tomasjs/core/http";
import { HttpServer } from "./HttpServer";
import { IterativeHttpPipeline, RecursiveHttpPipeline } from "./HttpPipeline";
import { benchmark } from "@/test/benchmark";

describe.skip("HttpPipeline", () => {
  const client = new HttpClient();
  const middlewareCount = 100;
  const iterations = 500;

  it("`should benchmark HttpPipeline", async () => {
    const recursiveServer = buildHttpServer(9090, "recursive");
    const iterativeServer = buildHttpServer(9091, "iterative");

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

  function buildHttpServer(port: number, pipelineMode: "recursive" | "iterative"): HttpServer {
    const server = new HttpServer({ port, pipelineMode });

    for (let i = 0; i < middlewareCount; i++) {
      server.use(async (req, res, next) => await next());
    }

    return server;
  }
});
