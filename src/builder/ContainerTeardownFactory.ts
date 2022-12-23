import { ContainerTeardown } from "./ContainerTeardown";

export interface ContainerTeardownFactory {
  create(): ContainerTeardown;
}
