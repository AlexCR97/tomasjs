import { CoreError, NotImplementedError } from "./errors.ts";

export type Key = string;

export function isKey(obj: unknown): obj is Key {
  return typeof obj === "string";
}

export const LIFETIME_TYPES = ["singleton", "transient"] as const;

export type Lifetime = (typeof LIFETIME_TYPES)[number];

export function isLifetime(obj: unknown): obj is Lifetime {
  return typeof obj === "string" && LIFETIME_TYPES.includes(obj as Lifetime);
}

export type Factory<T> = (resolver: Resolver) => T;

export function isFactory<T>(obj: unknown): obj is Factory<T> {
  return typeof obj === "function" && (obj.length === 0 || obj.length === 1);
}

export type Delegate<T> = (obj: T) => void;

export type Container = {
  get count(): number;

  add<T>(scope: Lifetime, key: Key, value: T): void;
  add<T>(scope: Lifetime, key: Key, factory: Factory<T>): void;

  addSingleton<T>(key: Key, value: T): void;
  addSingleton<T>(key: Key, factory: Factory<T>): void;

  addTransient<T>(key: Key, value: T): void;
  addTransient<T>(key: Key, factory: Factory<T>): void;

  clear(): void;

  contains(key: Key): boolean;

  delegate(callback: Delegate<Container>): void;

  remove(key: Key): boolean;

  build(): Resolver;
};

export type Resolver = {
  get count(): number;

  get<T>(key: Key): T;

  getOrNull<T>(key: Key): T | null;

  last<T>(key: Key): T;

  lastOrNull<T>(key: Key): T | null;

  search<T>(key: Key): T[];
};

export function createContainer(): Container {
  const services: ServiceDescriptor<unknown>[] = [];

  return {
    get count(): number {
      return services.length;
    },

    add(...args: unknown[]): void {
      const [lifetime, key, service] = args;

      if (isLifetime(lifetime) && isKey(key))
        return addService(lifetime, key, service);

      throw new NotImplementedError();
    },

    addSingleton<T>(key: Key, service: T): void {
      return addService("singleton", key, service);
    },

    addTransient<T>(key: Key, service: T): void {
      return addService("transient", key, service);
    },

    clear(): void {
      services.splice(0, services.length);
    },

    contains(key: Key): boolean {
      return services.some((sd) => sd.key === key);
    },

    delegate(callback: Delegate<Container>): void {
      callback(this);
    },

    remove(key: Key): boolean {
      const index: number = services.findIndex((sd) => sd.key === key);

      if (index === -1) {
        return false;
      }

      services.splice(index, 1);
      return true;
    },

    build(): Resolver {
      return createResolver(services);
    },
  };

  function addService(lifetime: Lifetime, key: Key, service: unknown): void {
    if (isFactory(service)) {
      services.push({ lifetime, key, service, type: "factory" });
    } else {
      services.push({ lifetime, key, service, type: "value" });
    }
  }
}

function createResolver(services: ServiceDescriptor<unknown>[]): Resolver {
  return {
    get count(): number {
      return services.length;
    },

    get<T>(key: Key): T {
      const descriptor = getServiceDescriptor<T>(key);

      if (descriptor === null) {
        throw new ServiceNotFoundError(key);
      }

      return resolve<T>(descriptor, this);
    },

    getOrNull<T>(key: Key): T | null {
      const descriptor = getServiceDescriptor<T>(key);

      if (descriptor === null) {
        return null;
      }

      return resolve<T>(descriptor, this);
    },

    last<T>(key: Key): T {
      const descriptor = getServiceDescriptor<T>(key, { last: true });

      if (descriptor === null) {
        throw new ServiceNotFoundError(key);
      }

      return resolve<T>(descriptor, this);
    },

    lastOrNull<T>(key: Key): T | null {
      const descriptor = getServiceDescriptor<T>(key, { last: true });

      if (descriptor === null) {
        return null;
      }

      return resolve<T>(descriptor, this);
    },

    search<T>(key: Key): T[] {
      return services
        .map((sd) => sd as ServiceDescriptor<T>)
        .filter((sd) => sd.key === key)
        .map((sd) => resolve<T>(sd, this));
    },
  };

  function getServiceDescriptor<T>(
    key: Key,
    options?: { last?: boolean }
  ): ServiceDescriptor<T> | null {
    const last: boolean = options?.last ?? false;

    const descriptor = last
      ? services.findLast((sd) => sd.key === key)
      : services.find((sd) => sd.key === key);

    if (descriptor === undefined) {
      return null;
    }

    return descriptor as ServiceDescriptor<T>;
  }

  function resolve<T>(descriptor: ServiceDescriptor<T>, thiz: Resolver): T {
    if (descriptor.type === "value") {
      return descriptor.service;
    }

    if (descriptor.type === "factory") {
      return descriptor.service(thiz);
    }

    throw new NotImplementedError();
  }
}

export class ServiceNotFoundError extends CoreError {
  constructor(key: Key) {
    super(`No service registered with key "${key}".`);
  }
}

type ServiceDescriptor<T> = {
  lifetime: Lifetime;
  key: Key;
} & (ValueServiceDescriptor<T> | FactoryServiceDescriptor<T>);

type ValueServiceDescriptor<T> = {
  type: "value";
  service: T;
};

type FactoryServiceDescriptor<T> = {
  type: "factory";
  service: Factory<T>;
};
