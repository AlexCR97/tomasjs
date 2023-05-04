import { Guard, GuardType } from "@/guards";
import { MiddlewareType } from "@/middleware";

export interface ApiBuilder<TBuilder extends ApiBuilder<any>> {
  useMiddleware(middleware: MiddlewareType): TBuilder;

  useGuard<TGuard extends Guard = Guard>(guard: GuardType<TGuard>): TBuilder;
}
