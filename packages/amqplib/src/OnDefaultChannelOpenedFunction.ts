import { Channel } from "amqplib";

export type OnDefaultChannelOpenedFunction = (channel: Channel) => void | Promise<void>;
