import { ClassConstructor } from "@/container";
import { QueryHandler } from "../QueryHandler";
import { QueryHandlerMetadataKeys } from "./QueryHandlerMetadataKeys";

export class QueryHandlerMetadata<TQuery, TResult> {
  private readonly queryConstructorKey = QueryHandlerMetadataKeys.queryConstructor;

  constructor(
    private readonly queryHandler:
      | QueryHandler<TQuery, TResult>
      | ClassConstructor<QueryHandler<TQuery, TResult>>
  ) {}

  get queryConstructor(): ClassConstructor<any> {
    //@ts-ignore: The package "reflect-metadata" should be imported by host
    return Reflect.getMetadata(this.queryConstructorKey, this.queryHandlerPrototype);
  }
  set queryConstructor(value: ClassConstructor<any>) {
    //@ts-ignore: The package "reflect-metadata" should be imported by host
    Reflect.defineMetadata(this.queryConstructorKey, value, this.queryHandlerPrototype);
  }

  private get queryHandlerPrototype() {
    return this.isQueryHandler(this.queryHandler)
      ? Object.getPrototypeOf(this.queryHandler)
      : this.queryHandler.prototype;
  }

  private isQueryHandler(obj: any): obj is QueryHandler<TQuery, TResult> {
    if (obj === undefined || obj === null) {
      return false;
    }

    const func = obj.fetch as Function;

    if (typeof func !== "function") {
      return false;
    }

    // Considering that the "fetch" property must be a named function...
    return (
      func.name.trim() === "fetch" && // The name must be "fetch"
      func.length === 1 // It must receive 1 argument
    );
  }
}
