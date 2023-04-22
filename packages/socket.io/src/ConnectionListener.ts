import { Socket } from "socket.io";

export interface ConnectionListener {
  onConnection(socket: Socket): void | Promise<void>;
}
