import { Headers } from "./Headers";
import { IRequestContext } from "./IRequestContext";
import { Payload } from "./Payload";
import { QueryParams } from "./QueryParams";

export abstract class RequestHandler<
  THeaders extends Headers = Headers,
  TQueryParams extends QueryParams = QueryParams,
  TPayload extends Payload = Payload,
  TResponse = any
> {
  abstract handle(context: IRequestContext<THeaders, TQueryParams, TPayload>): TResponse;
}
