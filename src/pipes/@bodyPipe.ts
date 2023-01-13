import { HttpContext } from "@/core";
import { httpContextPipe } from "./@httpContextPipe";
import { PayloadTransformDecoratorFactory } from "./PayloadTransformDecoratorFactory";
import { PipeTransformParam } from "./PipeTransformParam";

export class BodyTransformDecoratorFactory<
  TOutput
> extends PayloadTransformDecoratorFactory<TOutput> {
  constructor(private readonly _transform: PipeTransformParam<any, TOutput>) {
    super();
  }

  protected override transform = this._transform;
  protected override transformInput = (context: HttpContext) => context.request.body;
  protected override transformOutputSource = (context: HttpContext) => context.request;
  protected override transformOutputKey = "body";
}

export const bodyPipe1 = <TOutput>(transform: PipeTransformParam<any, TOutput>) => {
  return httpContextPipe(
    transform,
    (context) => context.request.body,
    (context) => context.request,
    "body"
  );
};

export const bodyPipe = <TOutput>(transform: PipeTransformParam<any, TOutput>) => {
  return new BodyTransformDecoratorFactory(transform).create();
};
