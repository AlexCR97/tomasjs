import {
  ClassConstructor,
  Container,
  ContainerSetupFactory,
  ContainerSetupFunction,
} from "@tomasjs/core";
import { QueryHandlerToken } from "./metadata";
import { QueryDispatcher } from "./QueryDispatcher";

export class UseQueries implements ContainerSetupFactory {
  constructor(private readonly queryHandlers?: ClassConstructor<any>[]) {}

  create(): ContainerSetupFunction {
    return (container) => {
      container.addClass(QueryDispatcher);
      this.registerHandlers(container);
    };
  }

  private registerHandlers(container: Container) {
    if (!this.queryHandlers) {
      return;
    }

    if (this.queryHandlers.length === 0) {
      return;
    }

    for (const handler of this.queryHandlers) {
      container.addClass(handler, { token: QueryHandlerToken });
    }
  }
}
