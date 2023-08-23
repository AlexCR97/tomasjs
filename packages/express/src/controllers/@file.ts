export const fileMetadataKey = "tomasjs:controller:method:payload:file";

export interface FileMetadata {
  formField: string;
  parameterIndex: number;
}

export function file(formField: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const metadata: FileMetadata[] =
      Reflect.getOwnMetadata(fileMetadataKey, target, propertyKey) ?? [];

    metadata.push({ parameterIndex, formField: formField });

    Reflect.defineMetadata(fileMetadataKey, metadata, target, propertyKey);
  };
}
