import { GuardType } from "@/guards";
import { Controller } from "../Controller";
import { ControllerType } from "../ControllerType";
import { isController } from "../isController";
import { HttpMethodMetadata } from "./HttpMethodMetadata";
import { Pipe, TomasError } from "@tomasjs/core";
import { MiddlewareType } from "@/middleware";
import { InterceptorType } from "@/interceptors";

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
        invalidKeys: [this.pathKey, this.middlewaresKey, this.interceptorsKey, this.guardsKey],
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

    // Get the decorated properties
    const result1 = Reflect.getMetadataKeys(this.controller);
    // console.log("result1", result1);

    // Filter out invalid properties
    const result2 = result1.filter(
      (key: any) => key !== this.pathKey && key !== this.middlewaresKey && key !== this.guardsKey
    );
    // console.log("result2", result2);

    // Convert the decorated properties into a strongly typed HttpMethodMetadata facade
    const result3 = result2.map((key: any) => new HttpMethodMetadata(this.controller, key));
    // console.log("result3", result3);

    // Filter out the invalid instances of HttpMethodMetadata
    // const result4 = result3.filter((metadata) => !metadata.instanceMethod || !metadata.httpMethod);
    // console.log("result4", result4);

    return result3;
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
