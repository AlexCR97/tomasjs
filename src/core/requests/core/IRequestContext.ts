import { Headers } from "./Headers";
import { Payload } from "./Payload";
import { QueryParams } from "./QueryParams";

export interface IRequestContext<
  THeaders extends Headers = Headers,
  TQueryParams extends QueryParams = QueryParams,
  TPayload extends Payload = Payload
> {
  headers?: THeaders;
  query?: TQueryParams;
  body?: TPayload;
}
