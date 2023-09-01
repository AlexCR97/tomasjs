import {
  ClassConstructor,
  Container,
  ContainerSetupFactory,
  ContainerSetupFunction,
} from "@tomasjs/core";
import { QueryDispatcher } from "./QueryDispatcher";
import { queryHandlerToken } from "./queryHandlerToken";

export class UseQueries implements ContainerSetupFactory {
  constructor(private readonly queryHandlers?: ClassConstructor<any>[]) {}

  private get handlers(): ClassConstructor<any>[] {
    return this.queryHandlers ?? [];
  }

  create(): ContainerSetupFunction {
    return (container) => {
      container.addClass(QueryDispatcher);
      this.registerHandlers(container);
    };
  }

  private registerHandlers(container: Container) {
    for (const handler of this.handlers) {
      container.addClass(handler, { token: queryHandlerToken });
    }
  }
}
