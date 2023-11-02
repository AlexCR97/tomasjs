import { Interceptor } from "@/interceptors";
import { ContainerSetupFactory, ContainerSetupFunction, TomasError } from "@tomasjs/core";
import { JwtDecoderOptions, JwtInterceptor } from "./jwt";

export class Authentication implements ContainerSetupFactory {
  constructor(schemes: AuthenticationSchemeEntry[]);
  constructor(options: AuthenticationOptions);
  constructor(configure: AuthenticationOptionsConfiguration);
  constructor(private readonly options: AuthenticationParam) {}

  create(): ContainerSetupFunction {
    return async (container) => {
      const options = this.getAuthenticationOptions();
      container.addInstance(options, AuthenticationOptions);
    };
  }

  private getAuthenticationOptions() {
    if (Array.isArray(this.options)) {
      return new AuthenticationOptions(this.options);
    }

    if (this.options instanceof AuthenticationOptions) {
      return this.options;
    }

    return this.buildAuthenticationOptions(this.options);
  }

  private buildAuthenticationOptions(
    configure: AuthenticationOptionsConfiguration
  ): AuthenticationOptions {
    const options = new AuthenticationOptions([]);
    configure(options);
    return options;
  }
}

type AuthenticationParam =
  | AuthenticationSchemeEntry[]
  | AuthenticationOptions
  | AuthenticationOptionsConfiguration;

export class AuthenticationOptions {
  constructor(private readonly _schemes: AuthenticationSchemeEntry[]) {}

  get schemes(): ReadonlyArray<AuthenticationSchemeEntry> {
    return this._schemes;
  }

  addScheme(scheme: AuthenticationScheme, interceptor: Interceptor): AuthenticationOptions {
    this._schemes.push(new AuthenticationSchemeEntry(scheme, interceptor));
    return this;
  }

  addJwtScheme(options: JwtDecoderOptions): AuthenticationOptions {
    return this.addScheme("jwt", new JwtInterceptor(options));
  }

  getScheme(scheme: AuthenticationScheme): Interceptor {
    const entry = this.schemes.find((x) => x.scheme === scheme);

    if (entry === undefined) {
      throw new TomasError(`No such scheme "${scheme}"`, { data: { scheme } });
    }

    return entry.interceptor;
  }
}

export class AuthenticationSchemeEntry {
  constructor(readonly scheme: AuthenticationScheme, readonly interceptor: Interceptor) {}
}

export type AuthenticationScheme = "jwt" | (string & {});

export type AuthenticationOptionsConfiguration = (options: AuthenticationOptions) => void;
