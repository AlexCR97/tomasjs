import { TokenBuilder, tomasJsToken } from "@tomasjs/core/tokens";

export const commandHandlerToken = new TokenBuilder()
  .with(tomasJsToken)
  .with("commandHandler")
  .build();
