import { injectable, globalContainer } from "@tomasjs/core";

export function guard() {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    globalContainer.addClass(constructor);
    return constructor;
  };
}
