import { DeferredContainerSetup } from "./DeferredContainerSetup";

export abstract class DeferredContainerSetupFactory {
  abstract create(): DeferredContainerSetup;
}
