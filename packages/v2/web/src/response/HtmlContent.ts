import { ResponseContent } from "./EndpointResponse";

export class HtmlContent extends ResponseContent<string> {
  override contentType: string = "text/html";

  constructor(data: string) {
    super(data);
  }

  override readContent(): string | Buffer | Uint8Array {
    return this.data;
  }
}
