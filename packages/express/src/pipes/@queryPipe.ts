// TODO Re-implement?

// import { HttpContext } from "@/core";
// import { PayloadTransformDecoratorFactory } from "./PayloadTransformDecoratorFactory";
// import { PipeTransformParam } from "./PipeTransformParam";

// class QueryTransformDecoratorFactory<TOutput> extends PayloadTransformDecoratorFactory<TOutput> {
//   constructor(
//     private readonly _key: string,
//     private readonly _transform: PipeTransformParam<any, TOutput>
//   ) {
//     super();
//   }

//   protected transform = this._transform;
//   protected transformInput = (context: HttpContext) => context.request.query[this._key];
//   protected transformOutputSource = (context: HttpContext) => context.request.query;
//   protected transformOutputKey = this._key;
// }

// export const queryPipe = <TOutput>(key: string, transform: PipeTransformParam<any, TOutput>) => {
//   return new QueryTransformDecoratorFactory(key, transform).create();
// };
