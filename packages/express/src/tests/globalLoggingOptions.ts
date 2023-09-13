import { globalLoggingOptions } from "@tomasjs/core";

// Controllers
globalLoggingOptions.minimumLevel.override("ControllerAdapter", "error");
globalLoggingOptions.minimumLevel.override("ControllerMetadata", "error");
globalLoggingOptions.minimumLevel.override("UseControllers", "error");

// Middlewares
globalLoggingOptions.minimumLevel.override("MiddlewareAdapter", "error");
globalLoggingOptions.minimumLevel.override("UseMiddlewares", "error");

// Interceptors
globalLoggingOptions.minimumLevel.override("UseInterceptors", "error");
