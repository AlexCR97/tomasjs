import { ContainerSetupFunction } from "./ContainerSetupFunction";

// TODO Convert this to an interface?
export abstract class ContainerSetupFactory {
  abstract create(): ContainerSetupFunction;
}
