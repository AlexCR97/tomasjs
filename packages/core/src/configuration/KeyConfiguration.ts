import { Configuration } from "./Configuration";

export interface KeyConfiguration<T extends object> {
  key: keyof Configuration<T>;
  type: "string" | "number" | "boolean";
}
