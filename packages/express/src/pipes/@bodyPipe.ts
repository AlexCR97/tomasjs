// TODO Re-implement?

// import { HttpContext } from "@/core";
// import { PayloadTransformDecoratorFactory } from "./PayloadTransformDecoratorFactory";
// import { PipeTransformParam } from "./PipeTransformParam";

// class BodyTransformDecoratorFactory<TOutput> extends PayloadTransformDecoratorFactory<TOutput> {
//   constructor(private readonly _transform: PipeTransformParam<any, TOutput>) {
//     super();
//   }

//   protected override transform = this._transform;
//   protected override transformInput = (context: HttpContext) => context.request.body;
//   protected override transformOutputSource = (context: HttpContext) => context.request;
//   protected override transformOutputKey = "body";
// }

// export const bodyPipe = <TOutput>(transform: PipeTransformParam<any, TOutput>) => {
//   return new BodyTransformDecoratorFactory(transform).create();
// };
