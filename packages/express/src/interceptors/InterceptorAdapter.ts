import { Container } from "@tomasjs/core";
import { InterceptorType } from "./InterceptorType";
import { ExpressMiddlewareFunction } from "@/core/express";
import { httpContextWriterFactory } from "@/core";
import { InterceptorResolver } from "./InterceptorResolver";

export class InterceptorAdapter {
  constructor(
    private readonly container: Container,
    private readonly interceptor: InterceptorType
  ) {}

  adapt(): ExpressMiddlewareFunction {
    return async (req, res, next) => {
      const httpContextWriter = httpContextWriterFactory(req, res);
      await new InterceptorResolver(this.container, this.interceptor).resolve(httpContextWriter);
      next();
    };
  }
}
