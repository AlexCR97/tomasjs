import { ContainerTeardownFunction } from "./ContainerTeardownFunction";

export interface ContainerTeardownFactory {
  create(): ContainerTeardownFunction;
}
