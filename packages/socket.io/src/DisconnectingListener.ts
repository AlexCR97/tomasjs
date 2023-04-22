import { DisconnectReason, Socket } from "socket.io";

export interface DisconnectingListener {
  onDisconnecting(socket: Socket, reason: DisconnectReason, description: any): void | Promise<void>;
}
