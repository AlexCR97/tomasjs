import { Logger } from "@tomasjs/logging";
import { Server } from "socket.io";

export interface SocketIOSetupOptions {
  server: Server;
  port?: number;
  logger?: Logger;
}
