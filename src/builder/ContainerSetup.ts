import { DependencyContainer } from "tsyringe";

export type ContainerSetup = (container: DependencyContainer) => void | Promise<void>;
