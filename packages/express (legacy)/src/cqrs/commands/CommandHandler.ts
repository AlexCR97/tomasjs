export interface CommandHandler<TCommand, TResult = void> {
  execute(command: TCommand): TResult | Promise<TResult>;
}
