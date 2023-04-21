export const HeaderMetadataKey = "tomasjs:controller:method:payload:header";

export interface HeaderMetadata {
  key: string;
  parameterIndex: number;
}

export function header(key: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const metadata: HeaderMetadata[] =
      Reflect.getOwnMetadata(HeaderMetadataKey, target, propertyKey) ?? [];

    metadata.push({ parameterIndex, key });

    Reflect.defineMetadata(HeaderMetadataKey, metadata, target, propertyKey);
  };
}
