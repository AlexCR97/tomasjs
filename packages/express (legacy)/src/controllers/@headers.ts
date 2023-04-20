export const HeadersMetadataKey = "tomasjs:controller:method:payload:headers";

export function headers() {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    //@ts-ignore: The package "reflect-metadata" should be imported by host
    Reflect.defineMetadata(HeadersMetadataKey, parameterIndex, target, propertyKey);
  };
}
