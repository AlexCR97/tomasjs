import { Token } from "./Token";

// For info on error: Unable to resolve signature of parameter decorator when called as an expression. Argument of type 'undefined' is not assignable to parameter of type 'string | symbol'.
// See: https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#more-accurate-type-checking-for-parameter-decorators-in-constructors-under-experimentaldecorators

export function inject<T>(token: Token<T>, options?: { multiple?: boolean }) {
  return function (target: Object, paramKey: undefined, paramIndex: number) {
    new InjectDecoratorMetadata(target, paramIndex).value = {
      token,
      paramIndex,
      multiple: options?.multiple ?? false,
    };
  };
}

export class InjectDecoratorMetadata<T> {
  private readonly symbol = Symbol.for("@inject");

  constructor(private readonly target: Object, private readonly paramIndex: number) {}

  get value(): InjectDecoratorMetadataValue<T> {
    return Reflect.getOwnMetadata(this.symbol, this.target, this.paramIndex.toString());
  }
  set value(value: InjectDecoratorMetadataValue<T>) {
    Reflect.defineMetadata(this.symbol, value, this.target, this.paramIndex.toString());
  }
}

export type InjectDecoratorMetadataValue<T> = {
  token: Token<T>;
  paramIndex: number;
  multiple: boolean;
};
