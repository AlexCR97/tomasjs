import { ContainerTeardownFunction } from "./ContainerTeardownFunction";
import { ContainerTeardownFactory } from "./ContainerTeardownFactory";

export type ContainerTeardownType = ContainerTeardownFunction | ContainerTeardownFactory;
