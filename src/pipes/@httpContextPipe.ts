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

    /**
     * This statement must explicitly set the value of descriptor.value
     * to be a function with the "handle" name and an HttpContext parameter.
     *
     * This needs to be this way so other parts of the framework can
     * correctly infer an Endpoint instance's type.
     */
    descriptor.value = function handle(httpContext: HttpContext) {
      if (
        httpContext === undefined ||
        httpContext === null ||
        !(httpContext instanceof HttpContext)
      ) {
        throw new TomasError(
          `The decorated function must have an argument that is an instance of ${HttpContext.name}`
        );
      }

      const transformInput = transformInputGetter(httpContext);
      // console.log("transformInput", transformInput);

      // TODO Will this support async/await?
      const transformOutput = new TransformBridge(transform).transform(transformInput);
      // console.log("transformOutput", transformOutput);

      const transformOutputSource = transformOutputSourceGetter(httpContext);
      // console.log("transformOutputSource", transformOutputSource);

      Reflect.set(transformOutputSource, transformOutputKey, transformOutput);

      return originalFunction.apply(this, httpContext);
    };

    return descriptor;
  };
}
