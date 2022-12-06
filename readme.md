# ThomasJS

## What is ThomasJS?

ThomasJS is the modern lightweight express framework 🔥😎.

Rapidly build highly scalable server side applications using ThomasJS's built-in:

- AppBuilder fluent api
- Dependency injection
- TypeScript-first support
- Object Oriented approach

## Use the pattern you like the most!

### Classic Controllers? we got'em!

```typescript
class GreeterController extends Controller {
  constructor() {
    super();
    this.route("greeter");
    this.post("/greet", (context: HttpContext) => {
      const name = context.request.body.name;
      return `Hello ${name}!`;
    });
  }
}

appBuilder.useJson().useController(GreeterController);
```

### Feeling bold? Use RequestHandlers!

```typescript
class GreetHandler extends RequestHandler<PlainTextResponse> {
  constructor() {
    super();
    this.method("post").path("/greeter/greet");
  }
  handle(context: HttpContext): PlainTextResponse {
    const request = context.request.getBody<GreetRequest>();
    return new PlainTextResponse(`Hello ${request.name}!`);
  }
}

appBuilder.useJson().useHttpContext().useRequestHandler(GreetHandler);
```

### Easy to use Middleware!

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

### Old school express? Go for it!

```typescript
appBuilder.use((app) => {
  app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
  });
});
```
