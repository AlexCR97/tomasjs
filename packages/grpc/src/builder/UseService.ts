import { ServiceDefinition, UntypedServiceImplementation } from "@grpc/grpc-js";
import { AppSetupFactory } from "./AppSetupFactory";
import { AppSetupFunction } from "./AppSetupFunction";
import { ClassConstructor, TomasLogger } from "@tomasjs/core";

export class UseService<TImplementation extends UntypedServiceImplementation>
  implements AppSetupFactory
{
  private readonly logger = new TomasLogger(`@tomasjs/grpc/${UseService.name}`, "debug");

  constructor(
    private readonly definition: ServiceDefinition<TImplementation>,
    private readonly implementation: ClassConstructor<TImplementation>
  ) {}

  create(): AppSetupFunction {
    return (server, container) => {
      container.addClass(this.implementation);
      const implementation = container.get(this.implementation);
      server.addService(this.definition, implementation);
    };
  }
}
