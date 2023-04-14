import { ContainerSetup, ContainerSetupFactory } from "@/builder";
import { ClassConstructor } from "@/container";
import { QueryHandlerToken } from "./metadata";

export class AddQueryHandlers extends ContainerSetupFactory {
  constructor(private readonly queryHandlers: ClassConstructor<any>[]) {
    super();
  }

  create(): ContainerSetup {
    return (container) => {
      if (!this.queryHandlers) {
        return;
      }

      if (this.queryHandlers.length === 0) {
        return;
      }

      for (const handler of this.queryHandlers) {
        container.addClass(handler, { token: QueryHandlerToken });
      }
    };
  }
}
