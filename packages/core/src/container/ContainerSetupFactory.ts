import { ContainerSetup } from "./ContainerSetup";

// TODO Convert this to an interface?
export abstract class ContainerSetupFactory {
  abstract create(): ContainerSetup;
}
