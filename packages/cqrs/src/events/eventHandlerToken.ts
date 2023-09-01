import { TokenBuilder, tomasJsToken } from "@tomasjs/core/tokens";

export const eventHandlerToken = new TokenBuilder().with(tomasJsToken).with("eventHandler").build();
