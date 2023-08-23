export const filesMetadataKey = "tomasjs:controller:method:payload:files";

export function files() {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    Reflect.defineMetadata(filesMetadataKey, parameterIndex, target, propertyKey);
  };
}
