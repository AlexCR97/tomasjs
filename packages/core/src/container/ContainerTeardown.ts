import { Container } from "./Container";

export type ContainerTeardown = (container: Container) => void | Promise<void>;
