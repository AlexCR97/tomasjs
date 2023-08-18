import { Connection } from "amqplib";

export type OnConnectedFunction = (connection: Connection) => void | Promise<void>;
