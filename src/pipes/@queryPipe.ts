import { httpContextPipe } from "./@httpContextPipe";
import { PipeTransformParam } from "./PipeTransformParam";

export function queryPipe<TOutput>(key: string, transform: PipeTransformParam<any, TOutput>) {
  return httpContextPipe(
    transform,
    (context) => context.request.query[key],
    (context) => context.request.query,
    key
  );
}
