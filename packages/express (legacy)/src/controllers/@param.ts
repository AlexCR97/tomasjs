export const ParamMetadataKey = "tomasjs:controller:method:payload:param";

export interface ParamMetadata {
  paramKey: string;
  parameterIndex: number;
}

export function param(key: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const metadata: ParamMetadata = {
      paramKey: key,
      parameterIndex,
    };

    //@ts-ignore: The package "reflect-metadata" should be imported by host
    Reflect.defineMetadata(ParamMetadataKey, metadata, target, propertyKey);
  };
}
