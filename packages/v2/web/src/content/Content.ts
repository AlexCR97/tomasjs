import { ContentType } from "./ContentType";

export abstract class Content<T> {
  abstract type: ContentType;

  constructor(readonly data: Buffer) {}

  abstract readData(): T;
}
