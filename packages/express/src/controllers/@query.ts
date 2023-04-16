export const QueryMetadataKey = "tomasjs:controller:method:payload:query";

export interface QueryMetadata {
  key?: string;
  parameterIndex: number;
}

export function query(key?: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const metadata: QueryMetadata[] =
      //@ts-ignore: The package "reflect-metadata" should be imported by host
      Reflect.getOwnMetadata(QueryMetadataKey, target, propertyKey) ?? [];

    metadata.push({ parameterIndex, key });

    //@ts-ignore: The package "reflect-metadata" should be imported by host
    Reflect.defineMetadata(QueryMetadataKey, metadata, target, propertyKey);
  };
}
