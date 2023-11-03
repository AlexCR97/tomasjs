import { GuardType } from "@/guards";
import { Controller } from "../Controller";
import { ControllerType } from "../ControllerType";
import { isController } from "../isController";
import { HttpMethodMetadata } from "./HttpMethodMetadata";
import { Pipe, TomasError } from "@tomasjs/core";
import { MiddlewareType } from "@/middleware";
import { InterceptorType } from "@/interceptors";
import { AuthenticationMetadata, AuthorizationMetadata } from "@/auth";

export class ControllerMetadata<TController extends Controller> {
  constructor(private readonly controller: ControllerType<TController>) {}

  /* #region Path */

  private readonly pathKey = "tomasjs:controller:path";

  get path(): string {
    return this.getMetadata(this.pathKey);
  }

  set path(value: string) {
    this.setMetadata(this.pathKey, value);
  }

  /* #endregion */

  /* #region Middlewares */

  private readonly middlewaresKey = "tomasjs:controller:middlewares";

  get middlewares(): MiddlewareType[] | undefined {
    return this.getMetadata<MiddlewareType[] | undefined>(this.middlewaresKey);
  }

  set middlewares(value: MiddlewareType[] | undefined) {
    this.setMetadata(this.middlewaresKey, value);
  }

  addMiddleware(...value: MiddlewareType[]) {
    if (this.middlewares === undefined) {
      this.middlewares = [];
    }

    this.middlewares.push(...value);
  }

  /* #endregion */

  /* #region Interceptors */

  private readonly interceptorsKey = "tomasjs:controller:interceptors";

  get interceptors(): InterceptorType[] | undefined {
    return this.getMetadata<InterceptorType[] | undefined>(this.interceptorsKey);
  }

  set interceptors(value: InterceptorType[] | undefined) {
    this.setMetadata(this.interceptorsKey, value);
  }

  addInterceptor(...value: InterceptorType[]) {
    if (this.interceptors === undefined) {
      this.interceptors = [];
    }

    this.interceptors.push(...value);
  }

  /* #endregion */

  /* #region Guards */

  private readonly guardsKey = "tomasjs:controller:guards";

  get guards(): GuardType[] | undefined {
    return this.getMetadata<GuardType[] | undefined>(this.guardsKey);
  }

  set guards(value: GuardType[] | undefined) {
    this.setMetadata(this.guardsKey, value);
  }

  addGuard(...value: GuardType[]): void {
    if (this.guards === undefined) {
      this.guards = [];
    }

    this.guards.push(...value);
  }

  /* #endregion */

  /* #region Authentication */

  private readonly authenticateKey = "tomasjs:controller:authenticate";

  get authenticate(): AuthenticationMetadata | undefined {
    return this.getMetadata(this.authenticateKey);
  }

  set authenticate(value: AuthenticationMetadata | undefined) {
    this.setMetadata(this.authenticateKey, value);
  }

  /* #endregion */

  /* #region Authorization */

  private readonly authorizeKey = "tomasjs:controller:authorize";

  get authorize(): AuthorizationMetadata | undefined {
    return this.getMetadata(this.authorizeKey);
  }

  set authorize(value: AuthorizationMetadata | undefined) {
    this.setMetadata(this.authorizeKey, value);
  }

  /* #endregion */

  /* #region HTTP Methods */

  get httpMethods(): HttpMethodMetadata[] {
    if (!isController<TController>(this.controller)) {
      throw new TomasError(
        'The method "get httpMethods" is only supported for Controller instances.'
      );
    }

    return (
      new Pipe({
        controller: this.controller,
        invalidKeys: [
          this.pathKey,
          this.middlewaresKey,
          this.interceptorsKey,
          this.guardsKey,
          this.authenticateKey,
          this.authorizeKey,
        ],
      })
        // Get decorated properties of controller
        .apply(({ controller, invalidKeys }) => {
          return {
            controller,
            invalidKeys,
            decoratedProperties: Reflect.getMetadataKeys(controller),
          };
        })
        // Keep only valid decorated properties
        .apply(({ controller, invalidKeys, decoratedProperties }) => {
          return {
            controller,
            validDecoratedProperties: decoratedProperties.filter(
              (key) => !invalidKeys.includes(key)
            ),
          };
        })
        // Convert the decorated properties into a strongly typed HttpMethodMetadata facade
        .apply(({ controller, validDecoratedProperties }) => {
          return validDecoratedProperties.map((key) => new HttpMethodMetadata(controller, key));
        })
        .get()
    );
  }

  /* #endregion */

  /* #region private */

  private get controllerPrototype() {
    return isController<TController>(this.controller)
      ? Object.getPrototypeOf(this.controller)
      : this.controller.prototype;
  }

  private setMetadata(key: string, value: any): void {
    Reflect.defineMetadata(key, value, this.controllerPrototype);
  }

  private getMetadata<T>(key: string): T {
    return Reflect.getMetadata(key, this.controllerPrototype);
  }

  /* #endregion */
}
