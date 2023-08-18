import { Token } from "./Token";

export interface ServiceProvider {
  get<T>(token: Token<T>): T;
  getOrDefault<T>(token: Token<T>): T | undefined;
  getAll<T>(token: Token<T>): T[];
}
