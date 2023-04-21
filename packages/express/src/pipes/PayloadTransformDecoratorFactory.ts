import { HttpContext } from "@/core";
import { PipeTransformParam } from "./PipeTransformParam";
import { TransformBridge } from "./TransformBridge";
import { TomasError } from "@tomasjs/core";

export abstract class PayloadTransformDecoratorFactory<TOutput> {
  /** The transformation to apply. */
  protected abstract transform: PipeTransformParam<any, TOutput>;

  /** The input of the transformation. */
  protected abstract transformInput: (context: HttpContext) => any;

  /** The source object where the transformation output should be injected. */
  protected abstract transformOutputSource: (context: HttpContext) => object;

  /** The key of the source object where the transformation output should be injected. */
  protected abstract transformOutputKey: string;

  create() {
    const factory = this;

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalFunction: Function = descriptor.value;

      descriptor.value = function handle(httpContext: HttpContext, ...args: any[]) {
        if (httpContext === undefined || httpContext === null) {
          throw new TomasError(
            `The decorated function must have an argument that is an instance of ${HttpContext.name}`
          );
        }

        const transformInput = factory.transformInput(httpContext);
        const transformOutput = new TransformBridge(factory.transform).transform(transformInput); // TODO Will this support async/await?
        const transformOutputSource = factory.transformOutputSource(httpContext);
        Reflect.set(transformOutputSource, factory.transformOutputKey, transformOutput);

        return originalFunction.apply(this, [httpContext, ...args]);
      };

      return descriptor;
    };
  }
}
