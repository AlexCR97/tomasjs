import { Container } from "./Container";
import { ServiceProvider } from "./ServiceProvider";
import { Token } from "./Token";

export class ServiceContainerProvider implements ServiceProvider {
  constructor(private readonly container: Container) {}

  get<T>(token: Token<T>): T {
    return this.container.get<T>(token);
  }

  getOrDefault<T>(token: Token<T>): T | undefined {
    return this.container.getOrDefault<T>(token);
  }

  getAll<T>(token: Token<T>): T[] {
    return this.container.getAll<T>(token);
  }
}
