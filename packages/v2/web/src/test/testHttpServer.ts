import { HttpServer } from "@/server";
import { TomasError } from "@tomasjs/core/errors";
import net from "net";

export async function testHttpServer(): Promise<HttpServer> {
  const maxAttempts = 100;
  const minPort = 10000;
  const maxPort = 65536;
  const port = await getAvailablePort();
  return new HttpServer({ port, pipelineMode: "iterative" });

  async function getAvailablePort(): Promise<number> {
    let attempt = 0;

    while (true) {
      attempt += 1;
      const port = getRandomPort();

      if (await isPortAvailable(port)) {
        return port;
      }

      if (attempt > maxAttempts) {
        throw new TomasError(
          "web/TestHttpServer",
          "Max attempts reached to find an available port."
        );
      }
    }
  }

  function getRandomPort(): number {
    return Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;
  }

  function isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();

      server.once("error", function (err) {
        return resolve(false);
      });

      server.once("listening", function () {
        server.close();
        return resolve(true);
      });

      server.listen(port);
    });
  }
}
