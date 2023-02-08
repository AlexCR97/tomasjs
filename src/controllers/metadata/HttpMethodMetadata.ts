import { HttpMethod } from "@/core";
import { ClassMethodMetadata } from "@/core/metadata";

export class HttpMethodMetadata {
  private readonly metadata: ClassMethodMetadata;

  constructor(target: object, propertyKey: string) {
    this.metadata = new ClassMethodMetadata(target, propertyKey);
  }

  /* #region instance method */

  private readonly instanceMethodKey = "tomasjs:controller:method:instanceMethod";

  get instanceMethod(): string {
    return this.metadata.get(this.instanceMethodKey);
  }

  set instanceMethod(value: string) {
    this.metadata.set(this.instanceMethodKey, value);
  }

  /* #endregion */

  /* #region http method */

  private readonly httpMethodKey = "tomasjs:controller:method:httpMethod";

  get httpMethod(): HttpMethod {
    return this.metadata.get(this.httpMethodKey);
  }

  set httpMethod(value: HttpMethod) {
    this.metadata.set(this.httpMethodKey, value);
  }

  /* #endregion */

  /* #region path */

  private readonly pathKey = "tomasjs:controller:method:path";

  get path(): string | undefined {
    return this.metadata.get(this.pathKey);
  }

  set path(value: string | undefined) {
    this.metadata.set(this.pathKey, value);
  }

  /* #endregion */
}
