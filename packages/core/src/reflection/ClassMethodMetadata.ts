export class ClassMethodMetadata {
  constructor(private readonly target: object, private readonly propertyKey: string) {}

  get<T>(key: string): T {
    //@ts-ignore: The package "reflect-metadata" should be imported by host
    const metadata = Reflect.getMetadata(this.propertyKey, this.target);
    return metadata[key];
  }

  set(key: string, value: any): void {
    //@ts-ignore: The package "reflect-metadata" should be imported by host
    let metadata = Reflect.getMetadata(this.propertyKey, this.target) ?? {};
    metadata[key] = value;
    //@ts-ignore: The package "reflect-metadata" should be imported by host
    Reflect.defineMetadata(this.propertyKey, metadata, this.target);
  }
}
