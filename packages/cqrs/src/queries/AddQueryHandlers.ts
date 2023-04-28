import { ClassConstructor, ContainerSetupFactory, ContainerSetupFunction } from "@tomasjs/core";
import { QueryHandlerToken } from "./metadata";

export class UseQueries implements ContainerSetupFactory {
  constructor(private readonly queryHandlers: ClassConstructor<any>[]) {}

  create(): ContainerSetupFunction {
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
