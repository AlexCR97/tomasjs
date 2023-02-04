import { NotImplementedError } from "@/core/errors";
import { MiddlewareParam } from "@/endpoints/MiddlewareParam";
import { GuardType } from "@/guards";
import { Controller } from "../Controller";
import { ControllerType } from "../ControllerType";

export class ControllerMetadata<TController extends Controller> {
  constructor(private readonly controller: ControllerType<TController>) {}

  /* #region path */

  get path(): string {
    return "";
  }

  set path(value: string) {}

  /* #endregion */

  /* #region Middlewares */

  private readonly middlewaresKey = "tomasjs:controller:middlewares";

  get middlewares(): MiddlewareParam[] | undefined {
    return this.getMetadata<MiddlewareParam[] | undefined>(this.middlewaresKey);
  }

  set middlewares(value: MiddlewareParam[] | undefined) {
    this.setMetadata(this.middlewaresKey, value);
  }

  addMiddleware(value: MiddlewareParam) {
    if (this.middlewares === undefined) {
      this.middlewares = [];
    }

    this.middlewares.push(value);
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

  addGuard(value: GuardType): void {
    if (this.guards === undefined) {
      this.guards = [];
    }

    this.guards.push(value);
  }

  /* #endregion */

  private setMetadata(key: string, value: any): void {
    Reflect.defineMetadata(key, value, this.controllerPrototype);
  }

  private getMetadata<T>(key: string): T {
    return Reflect.getMetadata(key, this.controllerPrototype);
  }

  private get controllerPrototype() {
    return isController(this.controller)
      ? Object.getPrototypeOf(this.controller)
      : (this.controller as any).prototype; // TODO Resolve any?
  }
}

function isController(obj: any): obj is Controller {
  throw new NotImplementedError(isController.name);
}
