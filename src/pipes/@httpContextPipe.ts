import { HttpContext } from "@/core";
import { TomasError } from "@/core/errors";
import { PipeTransformParam } from "./PipeTransformParam";
import { TransformBridge } from "./TransformBridge";

// attempt 1
export function httpContextPipe<TOutput>(
  transform: PipeTransformParam<any, TOutput>,
  transformInputGetter: (context: HttpContext) => any,
  transformOutputSourceGetter: (context: HttpContext) => object,
  transformOutputKey: string
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // console.log("target", target);
    // console.log("propertyKey", propertyKey);
    // console.log("descriptor", descriptor);

    const originalFunction: Function = descriptor.value;
    // console.log("originalFunction", originalFunction);
    // console.log("typeof originalFunction", typeof originalFunction);
    // console.log("originalFunction.length", originalFunction.length);

    /**
     * This statement must explicitly set the value of descriptor.value
     * to be a function with the "handle" name. This needs to be this way
     * in order to correctly infer an Endpoint instance's type.
     */
    descriptor.value = function (...args: any[]) {
      const httpContext: HttpContext = args.find((arg) => arg instanceof HttpContext);

      if (httpContext === undefined || httpContext === null) {
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

      return originalFunction.apply(this, args);
    };

    // console.log("descriptor.value", descriptor.value);
    // console.log("typeof descriptor.value", typeof descriptor.value);
    // console.log("descriptor.value.length", descriptor.value.length);

    return descriptor;
  };
}

// attempt 2
// export const httpContextPipe = <TOutput>(
//   transform: PipeTransformParam<any, TOutput>,
//   transformInputGetter: (context: HttpContext) => any,
//   transformOutputSourceGetter: (context: HttpContext) => object,
//   transformOutputKey: string
// ) => {
//   return (target: any, functionName: string, descriptor: PropertyDescriptor) => {
//     return {
//       get() {
//         console.log("target", target);
//         console.log("propertyKey", functionName);
//         console.log("descriptor", descriptor);

//         const originalFunction: Function = descriptor.value;
//         console.log("originalFunction", originalFunction);
//         console.log("typeof originalFunction", typeof originalFunction);
//         console.log("originalFunction.length", originalFunction.length);

//         const wrapperFunction = (...args: any[]) => {
//           const httpContext: HttpContext = args.find((arg) => arg instanceof HttpContext);

//           if (httpContext === undefined || httpContext === null) {
//             throw new TomasError(
//               `The decorated function must have an argument that is an instance of ${HttpContext.name}`
//             );
//           }

//           const transformInput = transformInputGetter(httpContext);
//           // console.log("transformInput", transformInput);

//           const transformOutput = new TransformBridge(transform).transform(transformInput); // TODO Will this support async/await?
//           // console.log("transformOutput", transformOutput);

//           const transformOutputSource = transformOutputSourceGetter(httpContext);
//           // console.log("transformOutputSource", transformOutputSource);

//           Reflect.set(transformOutputSource, transformOutputKey, transformOutput);

//           return originalFunction.apply(this, args);
//         };

//         Object.defineProperty(this, functionName, {
//           value: wrapperFunction,
//           configurable: true,
//           writable: true,
//         });

//         console.log("descriptor.value", descriptor.value);
//         console.log("typeof descriptor.value", typeof descriptor.value);
//         console.log("descriptor.value.length", descriptor.value.length);

//         return descriptor;
//       },
//     };
//   };
// };
