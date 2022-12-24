import { httpContextPipe } from "./@httpContextPipe";
import { PipeTransformParam } from "./PipeTransformParam";

export function paramPipe<TOutput>(key: string, transform: PipeTransformParam<any, TOutput>) {
  return httpContextPipe(
    transform,
    (context) => context.request.params[key],
    (context) => context.request.params,
    key
  );
}
