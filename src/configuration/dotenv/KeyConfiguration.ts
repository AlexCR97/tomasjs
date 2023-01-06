export interface KeyConfiguration<T extends object> {
  key: keyof T;
  type: "string" | "number" | "boolean" | "object";
}
