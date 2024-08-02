import { IRequest } from "./IRequest";

export interface RequestHandler<TRequest extends IRequest<TResult>, TResult> {
  handle(request: TRequest): Promise<TResult>;
}

export function isRequestHandler<TRequest extends IRequest<TResult>, TResult>(
  obj: unknown
): obj is RequestHandler<TRequest, TResult> {
  if (obj === null || obj === undefined) {
    return false;
  }

  const methodName: keyof RequestHandler<TRequest, TResult> = "handle";
  const methodDeclaration = (obj as any)[methodName];

  return (
    methodDeclaration !== null &&
    methodDeclaration !== undefined &&
    typeof methodDeclaration === "function" &&
    (methodDeclaration as Function).name === methodName &&
    (methodDeclaration as Function).length === 1
  );
}

export const REQUEST_HANDLERS = "@tomasjs/core/cqrs/RequestHandlers";
