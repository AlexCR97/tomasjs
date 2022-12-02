import { RequestContext } from "./RequestContext";

export abstract class AsyncRequestHandler<TResponse = void> {
  abstract handleAsync(context: RequestContext): Promise<TResponse>;
}
