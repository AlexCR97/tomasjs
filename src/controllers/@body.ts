// const requiredMetadataKey = Symbol("required");

// function required(target: Object, propertyKey: string | symbol, parameterIndex: number) {
//   let existingRequiredParameters: number[] =
//     Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
//   existingRequiredParameters.push(parameterIndex);
//   Reflect.defineMetadata(requiredMetadataKey, existingRequiredParameters, target, propertyKey);
// }

export const BodyMetadataKey = "tomasjs:controller:method:payload:body";

export function body() {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    console.log("@body", parameterIndex);
    Reflect.defineMetadata(BodyMetadataKey, parameterIndex, target, propertyKey);
  };
}
