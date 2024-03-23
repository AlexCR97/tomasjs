import { Container } from "./Container";

export type ContainerSetup = ContainerSetupFunction | ContainerSetupFunctionAsync;

export type ContainerSetupFunction = (container: Container) => void;

export type ContainerSetupFunctionAsync = (container: Container) => Promise<void>;
