import { hostname } from "os";
import { resolve } from "path";

export interface IEnvironment {
  readonly name: string;
  readonly host: string;
  readonly platform: string;
  readonly process: string;
  readonly rootPath: string;
}

export class Environment implements IEnvironment {
  constructor(
    readonly name: string,
    readonly host: string,
    readonly platform: string,
    readonly process: string,
    readonly rootPath: string
  ) {}

  static current(): Environment {
    return new Environment(
      this.getCurrentEnvironmentName(),
      hostname(),
      process.platform,
      process.title,
      resolve()
    );
  }

  private static readonly environmentKey = "TOMASJS_ENVIRONMENT";
  private static readonly defaultEnvironment = "development";
  private static getCurrentEnvironmentName(): string {
    const env = process.env[this.environmentKey];
    return env !== null && env !== undefined && env.trim().length > 0
      ? env
      : this.defaultEnvironment;
  }
}

export const environmentToken = "@tomasjs/core/Environment";
