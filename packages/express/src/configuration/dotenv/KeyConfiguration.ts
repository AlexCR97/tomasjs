export interface KeyConfiguration<TObject extends object> {
  key: keyof TObject;
  type: "string" | "number" | "boolean" | "object";
}
