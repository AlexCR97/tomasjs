import { HttpContext } from "@/core";
import { PayloadTransformDecoratorFactory } from "./PayloadTransformDecoratorFactory";
import { PipeTransformParam } from "./PipeTransformParam";

class ParamTransformDecoratorFactory<TOutput> extends PayloadTransformDecoratorFactory<TOutput> {
  constructor(
    private readonly _key: string,
    private readonly _transform: PipeTransformParam<any, TOutput>
  ) {
    super();
  }

  protected transform = this._transform;
  protected transformInput = (context: HttpContext) => context.request.params[this._key];
  protected transformOutputSource = (context: HttpContext) => context.request.params;
  protected transformOutputKey = this._key;
}

export const paramPipe = <TOutput>(key: string, transform: PipeTransformParam<any, TOutput>) => {
  return new ParamTransformDecoratorFactory(key, transform).create();
};
