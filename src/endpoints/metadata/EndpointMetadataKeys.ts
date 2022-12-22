export abstract class EndpointMetadataKeys {
  private constructor() {}

  private static readonly keyPrefix = "tomasjs:endpoint";

  static readonly httpMethodKey = `${this.keyPrefix}:httpMethod`;
  static readonly pathKey = `${this.keyPrefix}:path`;
  static readonly middlewaresKey = `${this.keyPrefix}:middlewares`;
}
