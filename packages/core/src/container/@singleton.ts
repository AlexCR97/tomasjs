import { globalContainer } from "./globalContainerInstance";

export function singleton() {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    //@ts-ignore: The package "reflect-metadata" should be imported by host
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    globalContainer.addClass(constructor, { scope: "singleton" });
    return constructor;
  };
}
