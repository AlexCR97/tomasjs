import { AsyncContainerSetup } from "./AsyncContainerSetup";

export abstract class AsyncContainerSetupFactory {
  abstract create(): AsyncContainerSetup;
}
