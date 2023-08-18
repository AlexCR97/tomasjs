import { Logger } from "@tomasjs/logging";
import { Server } from "socket.io";

export interface UseSocketIOOptions {
  server: Server;
  port?: number;
  logger?: Logger;
}
