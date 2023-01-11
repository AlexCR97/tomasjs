import { httpContextPipe } from "./@httpContextPipe";
import { PipeTransformParam } from "./PipeTransformParam";

export function bodyPipe<TOutput>(transform: PipeTransformParam<any, TOutput>) {
  return httpContextPipe(
    transform,
    (context) => context.request.body,
    (context) => context.request,
    "body"
  );
}
