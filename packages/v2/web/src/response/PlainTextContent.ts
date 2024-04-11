import { ResponseContent } from "./EndpointResponse";

export class PlainTextContent extends ResponseContent<string> {
  override contentType: string = "text/plain";

  constructor(data: string) {
    super(data);
  }

  override readContent(): string | Buffer | Uint8Array {
    return this.data;
  }
}
