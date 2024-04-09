import { TomasError } from "@/errors";
import { dot } from "@/system";
import {
  ConfigurationValueNotFoundError,
  ConfigurationValueType,
  ConfigurationValueTypeError,
} from "./ConfigurationValue";

export interface IConfigurationSection {
  section(path: string): IConfigurationSection | null;
  sectionOrThrow(path: string): IConfigurationSection;
  value<T>(type: ConfigurationValueType): T | null;
  valueOrThrow<T>(type: ConfigurationValueType): T;
}

export class ConfigurationSection implements IConfigurationSection {
  static readonly root = "$(root)";

  constructor(private readonly rootPath: string, private readonly root: Record<any, any>) {}

  static fromRoot(root: Record<any, any>): ConfigurationSection {
    return new ConfigurationSection(ConfigurationSection.root, root);
  }

  section(path: string): IConfigurationSection | null {
    const newRoot = dot<Record<any, any>>(this.root, path);

    if (newRoot === null || newRoot === undefined) {
      return null;
    }

    return new ConfigurationSection(path, newRoot);
  }

  sectionOrThrow(path: string): IConfigurationSection {
    const section = this.section(path);

    if (section === null) {
      throw new ConfigurationSectionNotFoundError(this.rootPath, path);
    }

    return section;
  }

  value<T>(type: ConfigurationValueType): T | null {
    if (this.root === undefined || this.root === null) {
      return null;
    }

    if (type === "boolean") {
      return this.valueToBoolean(this.root) as T;
    }

    if (type === "number") {
      return this.valueToNumber(this.root) as T;
    }

    if (type === "string") {
      return this.valueToString(this.root) as T;
    }

    if (type === "object") {
      return this.valueToObject(this.root) as T;
    }

    throw new ConfigurationValueTypeError(this.root, type);
  }

  private valueToBoolean(value: any): boolean {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      if (value === "true") {
        return true;
      }

      if (value === "false") {
        return false;
      }
    }

    throw new ConfigurationValueTypeError(value, "boolean");
  }

  private valueToNumber(value: any): number {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      return Number(value);
    }

    throw new ConfigurationValueTypeError(value, "number");
  }

  private valueToString(value: any): string {
    if (typeof value === "string") {
      return value;
    }

    throw new ConfigurationValueTypeError(value, "string");
  }

  private valueToObject(value: any): Record<any, any> {
    if (typeof value === "object") {
      return value;
    }

    throw new ConfigurationValueTypeError(value, "object");
  }

  valueOrThrow<T>(type: ConfigurationValueType): T {
    const value = this.value<T>(type);

    if (value === null) {
      throw new ConfigurationValueNotFoundError(this.rootPath);
    }

    return value;
  }
}

export class ConfigurationSectionNotFoundError extends TomasError {
  constructor(rootPath: string, sectionPath: string) {
    super("core/conf/SectionNotFound", `No such configuration section in path "${sectionPath}"`, {
      data: {
        rootPath,
        sectionPath,
      },
    });
  }
}
