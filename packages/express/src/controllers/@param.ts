import { TransformType } from "@/transforms";

export const ParamMetadataKey = "tomasjs:controller:method:payload:param";

export interface ParamMetadata {
  paramKey: string;
  parameterIndex: number;
  transform?: TransformType<any, any>;
}

export function param(key: string, options?: { transform: TransformType<any, any> }) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const metadata: ParamMetadata = {
      paramKey: key,
      parameterIndex,
      transform: options?.transform,
    };

    Reflect.defineMetadata(ParamMetadataKey, metadata, target, propertyKey);
  };
}
