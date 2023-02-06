export const BodyMetadataKey = "tomasjs:controller:method:payload:body";

export function body() {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    Reflect.defineMetadata(BodyMetadataKey, parameterIndex, target, propertyKey);
  };
}
