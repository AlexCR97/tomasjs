import amqp, { Options } from "amqplib";
import { ContainerSetup, ContainerSetupFactory } from "@/builder";
import { ChannelToken, ConnectionToken } from "./tokens";

export class AmqplibSetup extends ContainerSetupFactory {
  constructor(
    private readonly url: string | Options.Connect,
    private readonly socketOptions?: any
  ) {
    super();
  }

  create(): ContainerSetup {
    return async (container) => {
      const connection = await amqp.connect(this.url, this.socketOptions);
      container.addInstance(connection, ConnectionToken);

      const defaultChannel = await connection.createChannel();
      container.addInstance(defaultChannel, ChannelToken);
    };
  }
}
