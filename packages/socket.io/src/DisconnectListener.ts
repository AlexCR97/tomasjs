import { DisconnectReason, Socket } from "socket.io";

export interface DisconnectListener {
  onDisconnect(socket: Socket, reason: DisconnectReason, description: any): void | Promise<void>;
}
