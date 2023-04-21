export const HeadersMetadataKey = "tomasjs:controller:method:payload:headers";

export function headers() {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    Reflect.defineMetadata(HeadersMetadataKey, parameterIndex, target, propertyKey);
  };
}
