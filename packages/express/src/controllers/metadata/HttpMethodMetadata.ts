import { HttpMethod } from "@/core";
import { ClassMethodMetadata } from "@/core/metadata";
import { GuardType } from "@/guards";
import { InterceptorType } from "@/interceptors";
import { MiddlewareType } from "@/middleware";
import { RequiredArgumentError } from "@tomasjs/core";

export class HttpMethodMetadata {
  private readonly metadata: ClassMethodMetadata;

  constructor(target: object, propertyKey: string) {
    RequiredArgumentError.throw(target, "target");
    RequiredArgumentError.throw(propertyKey, "propertyKey");
    this.metadata = new ClassMethodMetadata(target, propertyKey);
  }

  /* #region instance method */

  private readonly instanceMethodKey = "tomasjs:controller:method:instanceMethod";

  get instanceMethod(): string {
    return this.metadata.get(this.instanceMethodKey);
  }

  set instanceMethod(value: string) {
    this.metadata.set(this.instanceMethodKey, value);
  }

  /* #endregion */

  /* #region http method */

  private readonly httpMethodKey = "tomasjs:controller:method:httpMethod";

  get httpMethod(): HttpMethod {
    return this.metadata.get(this.httpMethodKey);
  }

  set httpMethod(value: HttpMethod) {
    this.metadata.set(this.httpMethodKey, value);
  }

  /* #endregion */

  /* #region path */

  private readonly pathKey = "tomasjs:controller:method:path";

  get path(): string | undefined {
    return this.metadata.get(this.pathKey);
  }

  set path(value: string | undefined) {
    this.metadata.set(this.pathKey, value);
  }

  /* #endregion */

  /* #region Middlewares */

  private readonly middlewaresKey = "tomasjs:controller:method:middlewares";

  get middlewares(): MiddlewareType[] | undefined {
    return this.metadata.get<MiddlewareType[] | undefined>(this.middlewaresKey);
  }

  set middlewares(value: MiddlewareType[] | undefined) {
    this.metadata.set(this.middlewaresKey, value);
  }

  addMiddleware(...value: MiddlewareType[]) {
    if (this.middlewares === undefined) {
      this.middlewares = [];
    }

    this.middlewares.push(...value);
  }

  /* #endregion */

  /* #region Interceptors */

  private readonly interceptorsKey = "tomasjs:controller:method:interceptors";

  get interceptors(): InterceptorType[] | undefined {
    return this.metadata.get<InterceptorType[] | undefined>(this.interceptorsKey);
  }

  set interceptors(value: InterceptorType[] | undefined) {
    this.metadata.set(this.interceptorsKey, value);
  }

  addInterceptor(...value: InterceptorType[]) {
    if (this.interceptors === undefined) {
      this.interceptors = [];
    }

    this.interceptors.push(...value);
  }

  /* #endregion */

  /* #region Guards */

  private readonly guardsKey = "tomasjs:controller:method:guards";

  get guards(): GuardType[] | undefined {
    return this.metadata.get<GuardType[] | undefined>(this.guardsKey);
  }

  set guards(value: GuardType[] | undefined) {
    this.metadata.set(this.guardsKey, value);
  }

  addGuard(...value: GuardType[]) {
    if (this.guards === undefined) {
      this.guards = [];
    }

    this.guards.push(...value);
  }

  /* #endregion */
}
