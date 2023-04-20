export const BodyMetadataKey = "tomasjs:controller:method:payload:body";

export function body() {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    //@ts-ignore: The package "reflect-metadata" should be imported by host
    Reflect.defineMetadata(BodyMetadataKey, parameterIndex, target, propertyKey);
  };
}
