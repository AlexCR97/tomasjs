import net from "net";

function getRandomPort(): number {
  const min = 10000;
  const max = 65536;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function getAvailablePort(): Promise<number> {
  const maxAttempts = 100;
  let attempt = 0;

  while (true) {
    attempt += 1;
    const port = getRandomPort();

    if (await isPortAvailable(port)) {
      return port;
    }

    if (attempt > maxAttempts) {
      throw new Error(`Max attempts reached to find an available port.`);
    }
  }
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
