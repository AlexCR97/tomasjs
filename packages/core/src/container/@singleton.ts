import { injectable } from "./@injectable";
import { globalContainer } from "./globalContainerInstance";

export function singleton() {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    globalContainer.addClass(constructor, { scope: "singleton" }); // TODO how will this affect the module system when implemented?
    return constructor;
  };
}
