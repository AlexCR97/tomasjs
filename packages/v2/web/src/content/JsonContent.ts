import { Content } from "./Content";
import { ContentType } from "./ContentType";

export class JsonContent<T extends Record<string, any>> extends Content<T> {
  override type: ContentType = "application/json";

  readData(): T {
    const json = this.data.toString();
    return JSON.parse(json);
  }

  static from<T extends Record<string, any>>(json: T): JsonContent<T> {
    const jsonStr = JSON.stringify(json);
    const data = Buffer.from(jsonStr);
    return new JsonContent(data);
  }
}
