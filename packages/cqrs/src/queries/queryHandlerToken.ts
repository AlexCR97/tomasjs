import { TokenBuilder, tomasJsToken } from "@tomasjs/core/tokens";

export const queryHandlerToken = new TokenBuilder().with(tomasJsToken).with("queryHandler").build();
