export const HeaderMetadataKey = "tomasjs:controller:method:payload:header";

export interface HeaderMetadata {
  key: string;
  parameterIndex: number;
}

export function header(key: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const metadata: HeaderMetadata[] =
      //@ts-ignore: The package "reflect-metadata" should be imported by host
      Reflect.getOwnMetadata(HeaderMetadataKey, target, propertyKey) ?? [];

    metadata.push({ parameterIndex, key });

    //@ts-ignore: The package "reflect-metadata" should be imported by host
    Reflect.defineMetadata(HeaderMetadataKey, metadata, target, propertyKey);
  };
}
