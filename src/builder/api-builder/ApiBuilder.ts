import { ControllerType } from "@/controllers/ControllerType";
import { Endpoint, EndpointType } from "@/endpoints";
import { Guard, GuardType } from "@/guards";
import { Middleware, MiddlewareType } from "@/middleware";

export interface ApiBuilder<TBuilder extends ApiBuilder<any>> {
  useMiddleware<TMiddleware extends Middleware = Middleware>(
    middleware: MiddlewareType<TMiddleware>
  ): TBuilder;

  useGuard<TGuard extends Guard = Guard>(guard: GuardType<TGuard>): TBuilder;

  useEndpoint<TEndpoint extends Endpoint = Endpoint>(endpoint: EndpointType<TEndpoint>): TBuilder;

  useController<TController extends object = object>(
    controller: ControllerType<TController>
  ): TBuilder;
}
