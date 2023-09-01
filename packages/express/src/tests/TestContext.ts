import { LogLevel, Logger, TomasLogger } from "@tomasjs/core";
import { Server } from "http";
import { getAvailablePort } from "./getAvailablePort";

export class TestContext {
  readonly port: number;
  readonly address: string;
  readonly logger: Logger;
  server: Server | undefined;

  constructor(name: string, level?: LogLevel) {
    this.port = getAvailablePort();
    this.address = `http://localhost:${this.port}`;
    this.logger = new TomasLogger(name, level ?? "error");
  }

  dispose(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.server === undefined) {
        return resolve();
      }

      this.server.closeAllConnections();

      this.server.close((err) => {
        return err !== undefined ? reject(err) : resolve();
      });
    });
  }
}
