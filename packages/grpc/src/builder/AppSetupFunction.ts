import { Container } from "@tomasjs/core";
import { Server } from "@grpc/grpc-js";

export type AppSetupFunction = (server: Server, container: Container) => void | Promise<void>;
