import { Container } from "./Container";

export type ContainerTeardownFunction = (container: Container) => void | Promise<void>;
