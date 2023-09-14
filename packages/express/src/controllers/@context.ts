export const contextMetadataKey = "tomasjs:controller:method:context";

export function context() {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    Reflect.defineMetadata(contextMetadataKey, parameterIndex, target, propertyKey);
  };
}
