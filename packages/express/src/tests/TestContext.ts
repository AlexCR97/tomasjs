import { LogLevel, Logger, TomasLogger } from "@tomasjs/core";
import { Server } from "http";
import { getAvailablePort } from "./getAvailablePort";

export class TestContext {
  server: Server | undefined;

  private constructor(readonly port: number, readonly address: string, readonly logger: Logger) {}

  static async new(name: string, level?: LogLevel): Promise<TestContext> {
    const port = await getAvailablePort();
    const address = `http://localhost:${port}`;
    const logger = new TomasLogger(name, level ?? "error");
    return new TestContext(port, address, logger);
  }

  dispose(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.server === undefined) {
        return resolve();
      }

      this.server.close((err) => {
        return err !== undefined ? reject(err) : resolve();
      });
    });
  }
}
