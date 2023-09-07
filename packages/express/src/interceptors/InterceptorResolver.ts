import { Container, TomasError, isClassConstructor } from "@tomasjs/core";
import { InterceptorType } from "./InterceptorType";
import { HttpContextWriter } from "@/core";
import { isInterceptorFunction } from "./InterceptorFunction";
import { isInterceptorInstance } from "./Interceptor";
import { isInterceptorFactory } from "./InterceptorFactory";

export class InterceptorResolver {
  constructor(
    private readonly container: Container,
    private readonly interceptor: InterceptorType
  ) {}

  async resolve(context: HttpContextWriter): Promise<void> {
    if (isInterceptorFunction(this.interceptor)) {
      return await this.interceptor(context);
    }

    if (isInterceptorInstance(this.interceptor)) {
      return await this.interceptor.intercept(context);
    }

    if (isClassConstructor(this.interceptor)) {
      const interceptorInstance = this.container.get(this.interceptor);
      return await interceptorInstance.intercept(context);
    }

    if (isInterceptorFactory(this.interceptor)) {
      const interceptorType = this.interceptor.create();
      return await new InterceptorResolver(this.container, interceptorType).resolve(context);
    }

    throw new TomasError("`Unknown interceptor type", { data: { interceptor: this.interceptor } });
  }
}
