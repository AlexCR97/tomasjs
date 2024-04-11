import { ResponseContent } from "./EndpointResponse";

export class JsonContent<T extends Record<string, any>> extends ResponseContent<T> {
  override contentType: string = "application/json";

  constructor(data: T) {
    super(data);
  }

  override readContent(): string | Buffer | Uint8Array {
    return JSON.stringify(this.data);
  }
}
