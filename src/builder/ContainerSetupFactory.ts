import { ContainerSetup } from "./ContainerSetup";

export abstract class ContainerSetupFactory {
  abstract create(): ContainerSetup;
}
