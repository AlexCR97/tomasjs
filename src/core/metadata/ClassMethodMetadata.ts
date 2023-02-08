export class ClassMethodMetadata {
  constructor(private readonly target: object, private readonly propertyKey: string) {}

  get<T>(key: string): T {
    const metadata = Reflect.getMetadata(this.propertyKey, this.target);
    return metadata[key];
  }

  set(key: string, value: any): void {
    let metadata = Reflect.getMetadata(this.propertyKey, this.target) ?? {};
    metadata[key] = value;
    Reflect.defineMetadata(this.propertyKey, metadata, this.target);
  }
}
