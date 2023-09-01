import { ClassConstructor } from "@tomasjs/core";
import { QueryHandler } from "./QueryHandler";
import { TokenBuilder } from "@tomasjs/core/tokens";
import { queryHandlerToken } from "./queryHandlerToken";
import { isQueryHandler } from "./isQueryHandler";

export class QueryHandlerMetadata<TQuery, TResult> {
  private readonly queryConstructorKey = new TokenBuilder()
    .with(queryHandlerToken)
    .with("constructor")
    .build();

  constructor(
    private readonly queryHandler:
      | QueryHandler<TQuery, TResult>
      | ClassConstructor<QueryHandler<TQuery, TResult>>
  ) {}

  get queryConstructor(): ClassConstructor<any> {
    return Reflect.getMetadata(this.queryConstructorKey, this.queryHandlerPrototype);
  }
  set queryConstructor(value: ClassConstructor<any>) {
    Reflect.defineMetadata(this.queryConstructorKey, value, this.queryHandlerPrototype);
  }

  private get queryHandlerPrototype() {
    return isQueryHandler(this.queryHandler)
      ? Object.getPrototypeOf(this.queryHandler)
      : this.queryHandler.prototype;
  }
}
