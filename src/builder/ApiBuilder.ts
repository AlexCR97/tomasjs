import { Endpoint, EndpointType } from "@/endpoints";
import { Guard, GuardType } from "@/guards";
import { Middleware, MiddlewareType } from "@/middleware";

export interface ApiBuilder {
  useMiddleware<TMiddleware extends Middleware = Middleware>(
    middleware: MiddlewareType<TMiddleware>
  ): ApiBuilder;

  useGuard<TGuard extends Guard = Guard>(guard: GuardType<TGuard>): ApiBuilder;

  useEndpoint<TEndpoint extends Endpoint = Endpoint>(
    endpoint: EndpointType<TEndpoint>
  ): ApiBuilder;
}
