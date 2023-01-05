import { injectable, internalContainer } from "@/container";

export function guard() {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    internalContainer.addClass(constructor);
    return constructor;
  };
}
