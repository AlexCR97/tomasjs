import { container } from "tsyringe";
import { ContainerSetup } from "./ContainerSetup";
import { ContainerSetupFactory } from "./ContainerSetupFactory";

type Setup = ContainerSetup | ContainerSetupFactory;

export class ContainerBuilder {
  private readonly setups: Setup[] = [];

  setup(setup: Setup): ContainerBuilder {
    this.setups.push(setup);
    return this;
  }

  async buildAsync(): Promise<void> {
    for (const setup of this.setups) {
      const setupCallback = setup instanceof ContainerSetupFactory ? setup.create() : setup;
      await setupCallback(container);
    }
  }
}
