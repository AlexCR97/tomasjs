import { Channel, Connection } from "amqplib";

export type OnBootstrappedFunction = (
  connection: Connection,
  channel: Channel
) => void | Promise<void>;
