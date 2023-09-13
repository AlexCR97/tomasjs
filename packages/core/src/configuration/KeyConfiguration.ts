export interface KeyConfiguration<T extends Record<string, any>> {
  /**
   * A key from the configuration type.
   */
  key: keyof T | (string & {}); // Use "string & {}" to get autocomplete and also be able to pass strings

  /**
   * The notation used to retrieve the key from the configuration type.
   * @example "."
   * @example "__"
   */
  keyNotation?: string;

  /**
   * The type to transform the key into.
   */
  type?: "string" | "number" | "boolean";

  /**
   * Wether this key should be overridden by an environment variable with the same key.
   */
  overrideFromEnvironment?: boolean;

  /**
   * A fixed value that should be given to this key.
   */
  value?: any;
}
