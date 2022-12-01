# {{coolname}}

## What is {{coolname}}?

{{coolname}} is the modern express framework 🔥😎.

Rapidly build highly scalable server side applications using {{coolname}}'s built-in:

- AppBuilder fluent api
- Dependency injection
- TypeScript-first support
- Object Oriented Programming design patterns
- And more!

## Use whatever pattern you like the most!

### Classic `Controllers`? we got'em!

```typescript
@injectable()
class GreeterController extends BaseController {
  route = "greeter";
  constructor() {
    super();
    this.post("/greet", (req: Request, res: Response) => {
      const name = req.body.name;
      return res.json({ message: `Hello ${name}!` });
    });
  }
}

appBuilder.useController(GreeterController);
```

### Feeling bold? Use `RequestHandler`s!

```typescript
@injectable()
class GreetRequestHandler extends RequestHandler<PlainTextResponse> {
  handle(context: RequestContext): PlainTextResponse {
    const request = context.getBody<GreetRequest>();
    return new PlainTextResponse(`Hello ${request.name}!`);
  }
}

appBuilder.useRequestHandler("post", "/greeter/greet", GreetRequestHandler);
```

### `CQRS`? Weird... but supported!

```typescript
@injectable()
class GreeterCommandHandler extends CommandHandler<GreeterCommand> {
  constructor(@inject(EventDispatcher) eventDispatcher: EventDispatcher) {
    super();
  }

  handle(command: GreeterCommand) {
    this.eventDispatcher.dispatch(new GreetedEvent(command.name));
  }
}

appBuilder.useCommandHandler(GreeterCommandHandler);
```

### Easy to use `Middleware`!

```typescript
@injectable()
class RequestLoggerMiddleware extends Middleware {
  private readonly logger: ILogger;

  constructor(@inject("ILoggerProvider") loggerProvider: ILoggerProvider) {
    super();
    this.logger = loggerProvider.createLogger("RequestLoggerMiddleware");
  }

  handle(req: Request, res: Response, next: NextFunction): void {
    this.logger.info("Log your request here!");
    next();
  }
}

appBuilder.useMiddleware(RequestLoggerMiddleware);
```

### Old school `express`? Go for it!

```typescript
appBuilder.use((app) => {
  app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
  });
});
```
