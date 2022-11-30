import { RequestContext } from "./RequestContext";

export abstract class RequestHandler<TResponse = void> {
  abstract handle(context: RequestContext): TResponse;
}
