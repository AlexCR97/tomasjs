import { IContainer } from "./Container";

export type ContainerSetup = ContainerSetupFunction | ContainerSetupFunctionAsync;

export type ContainerSetupFunction = (container: IContainer) => void;

export type ContainerSetupFunctionAsync = (container: IContainer) => Promise<void>;
