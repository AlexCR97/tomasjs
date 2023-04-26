import { Container } from "./Container";

export type ContainerSetupFunction = (container: Container) => void | Promise<void>;
