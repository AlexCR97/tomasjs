import { injectable, globalContainer } from "@tomasjs/core";
import { ControllerMetadata } from "./metadata/ControllerMetadata";

export function controller(path?: string) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    //@ts-ignore: The package "reflect-metadata" should be imported by host
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    globalContainer.addClass(constructor);

    if (path) {
      const metadata = new ControllerMetadata(constructor);
      metadata.path = path;
    }

    return constructor;
  };
}
