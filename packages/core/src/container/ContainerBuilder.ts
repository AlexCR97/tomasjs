import { ClassConstructor } from "@/reflection";
import { Container } from "./Container";
import { ContainerSetupType } from "./ContainerSetupType";
import { ServiceProvider } from "./ServiceProvider";
import { Token } from "./Token";
import { Scope } from "./Scope";

export interface ContainerBuilder {
  addClass<T>(
    constructor: ClassConstructor<T>,
    options?: { token?: Token<T>; scope?: Scope }
  ): ContainerBuilder;
  addInstance<T>(instance: T, token: Token<T>): ContainerBuilder;
  setup(setup: ContainerSetupType): ContainerBuilder;
  buildContainerAsync(): Promise<Container>;
  buildServiceProviderAsync(): Promise<ServiceProvider>;
}
