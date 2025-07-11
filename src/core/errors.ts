// TODO Rename
export class CoreError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export class NotImplementedError extends CoreError {
  constructor(options?: ErrorOptions) {
    super("Not implemented.", options);
  }
}
