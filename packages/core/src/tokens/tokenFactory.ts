import { TokenBuilder } from "./TokenBuilder";

export function tokenFactory(...parts: string[]): string {
  const tokenBuilder = new TokenBuilder();

  for (const part of parts) {
    tokenBuilder.with(part);
  }

  return tokenBuilder.build();
}
