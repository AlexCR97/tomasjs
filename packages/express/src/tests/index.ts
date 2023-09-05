import { globalLoggingOptions } from "@tomasjs/core";
globalLoggingOptions.minimumLevel.override("MiddlewareAdapter", "error");
globalLoggingOptions.minimumLevel.override("UseMiddlewares", "error");

export { TestContext } from "./TestContext";
export { tick } from "./tick";
