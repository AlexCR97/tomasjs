import { Container } from "./Container";

export type ContainerSetup = (container: Container) => void | Promise<void>;
