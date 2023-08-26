export interface KeyConfiguration<T extends Record<string, any>> {
  key: keyof T;
  type?: "string" | "number" | "boolean";
  overrideFromEnvironment?: boolean;
}
