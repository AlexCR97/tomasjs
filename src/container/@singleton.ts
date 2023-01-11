import { injectable, internalContainer } from "@/container";

export function singleton() {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    internalContainer.addClass(constructor, { scope: "singleton" });
    return constructor;
  };
}
