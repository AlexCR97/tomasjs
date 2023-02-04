import { injectable, internalContainer } from "@/container";
import { ControllerMetadata } from "./metadata/ControllerMetadata";

export function controller(path?: string) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    internalContainer.addClass(constructor);

    if (path) {
      const metadata = new ControllerMetadata(constructor);
      metadata.path = path;
    }

    return constructor;
  };
}
