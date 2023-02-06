export const QueryMetadataKey = "tomasjs:controller:method:payload:query";

export interface QueryMetadata {
  key?: string;
  parameterIndex: number;
}

export function query(key?: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const metadata: QueryMetadata[] =
      Reflect.getOwnMetadata(QueryMetadataKey, target, propertyKey) ?? [];

    metadata.push({ parameterIndex, key });

    Reflect.defineMetadata(QueryMetadataKey, metadata, target, propertyKey);
  };
}
