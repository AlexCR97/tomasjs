import { IContainer } from "@/container";

export type ContainerTeardown = (container: IContainer) => void | Promise<void>;
