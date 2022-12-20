import { IContainer } from "@/container";

export type ContainerSetup = (container: IContainer) => void | Promise<void>;
