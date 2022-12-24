import { HttpContext } from "@/core";
import { TomasError } from "@/core/errors";
import { PipeTransformParam } from "./PipeTransformParam";
import { TransformBridge } from "./TransformBridge";

export function httpContextPipe<TOutput>(
  transform: PipeTransformParam<any, TOutput>,
  transformInputGetter: (context: HttpContext) => any,
  transformOutputSourceGetter: (context: HttpContext) => object,
  transformOutputKey: string
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalFunction = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const httpContext: HttpContext = args.find((arg) => arg instanceof HttpContext);

      if (httpContext === undefined || httpContext === null) {
        throw new TomasError(
          `The decorated function must have an argument that is an instance of ${HttpContext.name}`
        );
      }

      const transformInput = transformInputGetter(httpContext);
      console.log("transformInput", transformInput);

      // TODO Will this support async/await?
      const transformOutput = new TransformBridge(transform).transform(transformInput);
      console.log("transformOutput", transformOutput);

      const transformOutputSource = transformOutputSourceGetter(httpContext);
      console.log("transformOutputSource", transformOutputSource);

      Reflect.set(transformOutputSource, transformOutputKey, transformOutput);

      return originalFunction.apply(this, args);
    };

    return descriptor;
  };
}
