import { ClassConstructor } from "@/container";

/**
 * Defines a set of accessors for a CommandHandler
 */
export interface ICommandHandlerMetadata {
  get commandConstructor(): ClassConstructor<any>;
  set commandConstructor(value: ClassConstructor<any>);
}
