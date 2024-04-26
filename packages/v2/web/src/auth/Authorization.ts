import { Middleware } from "@/server/Middleware";
import { MiddlewareAggregate } from "@/server/MiddlewareAggregate";
import { IRequestContextReader, RequestContextReader } from "@/server/RequestContext";

export type AuthorizationPolicy = (request: IRequestContextReader) => boolean | Promise<boolean>;

export function authorization(policy: AuthorizationPolicy): Middleware[] {
  return new MiddlewareAggregate()
    .addInterceptor(async (req) => {
      if (!req.user.authenticated) {
        return;
      }

      const reqReader = RequestContextReader.from(req);
      const authorized = await policy(reqReader);

      if (authorized) {
        req.user.authorize();
      }
    })
    .addGuard((req) => {
      return req.user.authenticated && req.user.authorized ? true : 403;
    })
    .get();
}
