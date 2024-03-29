# TomasJS

## What is TomasJS?

TomasJS is the modern lightweight express framework 🔥😎.

Rapidly build highly scalable server side applications using TomasJS's built-in:

- TypeScript-first support
- AppBuilder fluent API for your HTTP pipeline
- ContainerBuilder fluent API for Dependency injection
- Object Oriented approach
- Endpoints, Middlewares, Loggers, Configuration and more!

## Guides

- [Getting started](#getting-started)
  - [Installation](#installation)
  - [Your first TomasJS app](#your-first-tomasjs-app)
- [Fundamentals](#fundamentals)
  - [AppBuilder](#appbuilder)
  - [Endpoints](#endpoints)
    - [Endpoint interface](#endpoint-interface)
    - [AnonymousEndpoint class](#anonymousendpoint-class)
    - [HttpContext](#httpcontext)
    - [HttpContext typing](#httpcontext-typing)
  - [EndpointGroups](#endpoint-groups)
  - [Middlewares](#middlewares)
    - [MiddlewareFunction](#middlewarefunction)
    - [Middleware interface](#middleware-interface)
    - [AnonymousMiddleware class](#anonymousmiddleware-class)
    - [MiddlewareFactory](#middlewarefactory)
    - [Middleware levels](#middleware-levels)
  - [Guards](#guards)
    - [GuardFunction](#guardfunction)
    - [Guard interface](#guard-interface)
    - [GuardFactory](#guardfactory)
  - [Pipes](#pipes)
    - [Transforms](#transforms)
      - [TransformFunction](#transformfunction)
      - [Transform interface](#transform-interface)
      - [TransformFactory](#transformfactory)
    - [@bodyPipe](#bodypipe)
    - [@paramPipe](#parampipe)
    - [@queryPipe](#querypipe)
  - [Error Handling](#error-handling)
    - [TomasErrorHandler: The default error handler](#tomaserrorhandler-the-default-error-handler)
    - [Custom error handlers](#custom-error-handlers)
      - [ErrorHandlerFunction](#errorhandlerfunction)
      - [ErrorHandler interface](#errorhandler-interface)
- [Dependency Injection](#dependency-injection)
  - [Quick Guide](#quick-guide)
  - [ContainerBuilder](#containerbuilder)
  - [ContainerSetupFactory](#containersetupfactory)
- Authentication/Authorization
  - JwtGuard
  - RequiredClaimGuard
- API Validations
  - fluentvalidation
- Logging
- Configuration
  - Dotenv
- Lifecycle
  - Middleware
  - Guard
  - Pipe
  - Endpoints
  - ErrorHandler
- Databases
  - MikroORM
- Samples
- Other Resources
  - Response Types

# Getting started

## Installation

Create a node.js express project and run the following command:

```
npm install tomasjs
```

## Your first TomasJS app

Create the following file:

```ts
// main.ts

import "reflect-metadata";
import { AppBuilder } from "tomasjs/builder";
import { AnonymousEndpoint } from "tomasjs/endpoints";

const PORT = 3000;

async function main() {
  console.log("Creating a TomasJS app...");

  await new AppBuilder()
    .useEndpoint(
      new AnonymousEndpoint("get", "/", () => {
        return "Hello, TomasJS!";
      })
    )
    .buildAsync(PORT);

  console.log(`TomasJS app running in port ${PORT}`);
}

main();
```

Now run the file.

You should be able to reach your app at http://localhost:3000. The following content should be displayed in your browser

```
Hello, TomasJS!
```

Congratulations! You just created for first TomasJS app!

# Fundamentals

## AppBuilder

The AppBuilder class is what you'll be using to bootstrap the HTTP pipeline of your application. It provides a fluent API to easily register the different parts of your application.

To create an object of the AppBuilder class, simply instantiate the class:

```ts
const app = new AppBuilder();
```

The simplest way to use the AppBuilder is to register an endpoint using plain old express:

```ts
app.use((express) => {
  express.get("/resource", (req, res) => {
    res.send("This is a resource");
  });
});
```

In the above example, we registered a simple get endpoint using the AppBuilder's `use` method, which lets us use the underlying express app instance. So just about any valid express code should be usable in a TomasJS app.

When you have finished bootstrapping your HTTP pipeline, call the `buildAsync` method and pass in an available port number.

> We recommend wrapping your bootstrap code into an async function, since TomasJS relies on promises to build the application.

```ts
async function main() {
  // Your bootstrap code
  // ...
  await app.buildAsync(3000);
}
```

Your application should now be running in the specified port.

As you can see, using plain old express should be usable, but the more TomasJS way of achieving this is to use Endpoints, which will be covered in the next section.

## Endpoints

### Endpoint interface

The Endpoint interface provides an abstraction and a better development experience to bootstrap an endpoint into our application.

Consider the previous example:

```ts
app.use((express) => {
  express.get("/resource", (req, res) => {
    res.send("This is a resource");
  });
});
```

While it's okay and it works, it's rather verbose and it really doesn't give us much information about what the endpoint should do.

Enter the Endpoint interface:

```ts
@endpoint("get")
@path("resource")
class GetResource implements Endpoint {
  handle(context: HttpContext) {
    return "This is a resource";
  }
}
```

By declaring the GetResource class, we immediately have a more descriptive way of creating an endpoint, which gives us a better hint on what our endpoint's responsibility is, while at the same time, you get all of the benefits of an OOP approach and maintain a separation of concerns between each endpoint class.

Let's analyze the used decorators.

```ts
@endpoint("get")
```

The `@endpoint` decorator tells TomasJS that the class is, in fact, an endpoint. It is required so that the framework can correctly bootstrap it into the HTTP pipeline.

It takes an optional parameter of type `HttpMethod`, with the following valid values: `"get"`, `"post"`, `"put"`, `"delete"`, `"patch"`. The default value for this parameter is `"get"`.

```ts
@path("resource")
```

The `@path` decorator tells TomasJS where this endpoint should be reached. This decorator is optional.

In this example you would reach the endpoint at `GET http://localhost/resource`.

If you omit the @path decorator, the path used will be `"/"`.

> Notice that the path is `"resource"` and not `"/resource"`. This is the pattern you must follow since TomasJS does not expect paths to start with a `"/"`, <b>EXCEPT</b> for an empty path. In summary: The `"/"` path is valid, the `"resource"` path is valid, and the `"/resource"` path is invalid.

Now let's look at the class declaration:

```ts
class GetResource implements Endpoint
```

The Endpoint interface declares a single `handle` method which the class must implement:

```ts
handle(context: HttpContext) {
  return "This is a resource";
}
```

The return value of this method will be the response sent to the client.

This method declares the parameter `context: HttpContext`. The use of this parameter will be discussed in the following sections.

Now register your endpoint using the AppBuilder's `useEndpoint` method:

```ts
app.useEndpoint(GetResource);
```

### AnonymousEndpoint class

If you don't like the idea of creating classes just to define an endpoint, you can always rely on the AnonymousEndpoint class.

```ts
app.useEndpoint(
  new AnonymousEndpoint("get", "/", (context) => {
    return "This is a resource";
  })
);
```

> Although using the AnonymousEndpoint class let's us quickly create an endpoint without the need of declaring an entire class, we highly recommend sticking to class based endpoints since you get a lot more benefits, primarily dependency injection, which will be discussed further on.

### HttpContext

You might have noticed that when using the Endpoint interface, the class must implement the `handle` method which passes a `context` parameter:

```ts
handle(context: HttpContext) {
  //...
}
```

This parameter is an instance of the HttpContext class, which exposes the HTTP request, response, user and optional metadata.

We can use this parameter to:

- Get path parameters.
- Get query parameters.
- Get the request body.
- Get the request headers.
- Set response headers.
- Respond to the client.

And just about anything you can normally do with the well known `(req, res)` parameters of express.

**Get a path parameter**

```ts
handle(context: HttpContext) {
  const userId = context.request.params.id;
  // Do something with userId
}
```

**Get a query parameter**

```ts
handle(context: HttpContext) {
  const pageSize = context.request.query.pageSize;
  // Do something with pageSize
}
```

**Get the request body**

```ts
handle(context: HttpContext) {
  const payload = context.request.body;
  // Do something with payload
}
```

**Get a request header**

```ts
handle(context: HttpContext) {
  const authHeader = context.request.headers.authorization;
  // Do something with authHeader
}
```

**Set a response header**

```ts
handle(context: HttpContext) {
  context.response.setHeader("key", "value");
}
```

**Respond to the client**

```ts
handle(context: HttpContext) {
  context.respond({ message: "My response" });
}
```

> Using the `respond` method behaves the same as returning a value from the `handle` method.

### HttpContext typing

Know that any value retrieved from the HttpContext will be of type string or object.

Consider the following example:

```ts
handle(context: HttpContext) {
  const pageSize: number = context.request.query.pageSize; // Careful here!
}
```

The code above should show an error.

One would think the query parameter would be of type number, but since TypeScript is not really a statically typed language, any incoming value is actually a string (or an object in other scenarios).

A workaround to this would be to do the following:

```ts
handle(context: HttpContext) {
  const pageSizeStr = context.request.query.pageSize;
  const pageSize = Number(pageSizeStr); // This should now be a number
}
```

A similar issue occurs with the request body, where the incoming data is a POJO (Plain Old JavaScript Object):

```ts
handle(context: HttpContext) {
  const user: User = context.request.body;
  const isUserInstance = user instanceof User; // This will be false
}
```

So if you wanted to use a class instance feature like a method/getter/setter, you wouldn't be able to since the request body does not have the class's prototype.

A workaround to this would be to manually create a User instance using the request body.

> We know the workarounds mentioned above are ugly and provide a horrible developer experience, which is why TomasJS has built-in solutions for these exact scenarios: `Pipes` and `Transformations`. Both of these are discussed in later sections.

## Endpoint Groups

TomasJS doesn't use the conventional controllers approach. Instead, to group a set of related endpoints, TomasJS uses EndpointGroups.

Suppose a typical users CRUD:

- POST users
- GET users
- GET users/:id
- PUT users/:id
- DELETE users/:id

It would be quite annoying to have to repeat the same path over and over again across all of out endpoint classes. Instead, we can do the following:

```ts
@endpoint()
@path(":id")
class GetUserByIdEndpoint implements Endpoint {
  async handle(context: HttpContext) {
    // Get user
  }
}

// ... the rest of your endpoints ...

app.useEndpointGroup((endpoints) =>
  endpoints
    .useBasePath("users")
    .useEndpoint(CreateUserEndpoint)
    .useEndpoint(GetUserByIdEndpoint)
    .useEndpoint(GetAllUsersEndpoint)
    .useEndpoint(UpdateUserEndpoint)
    .useEndpoint(DeleteUserEndpoint)
);
```

Doing this over controllers has several benefits:

- We immediately get an overview of how our API looks like.
- Endpoints can share functionality from the parent EndpointGroup (Middlewares, Guards, etc.).
- EndpointGroups are configurable at high level, so you manage them from 1 single place.
- EndpointGroups are re-usable, so you could can theme in child/parent APIs, e.g., imagine having the `/orders` API and re-using it in the `/users/orders` API.

## Middlewares

For the following examples we will create a middleware that logs the request body.

### MiddlewareFunction

```ts
const loggerMiddleware: MiddlewareHandler = ({ request }, next) => {
  console.log("request body:", request.body);
  next();
};
```

### Middleware interface

```ts
@singleton()
class LoggerMiddleware implements Middleware {
  handle({ request }: HttpContext, next: NextFunction): void | Promise<void> {
    console.log("request body:", request.body);
    next();
  }
}
```

### AnonymousMiddleware class

```ts
const loggerMiddleware = new AnonymousMiddleware(({ request }, next) => {
  console.log("request body:", request.body);
});
```

### MiddlewareFactory

```ts
class LoggerMiddlewareFactory implements MiddlewareFactory {
  constructor(private readonly source: string) {}

  create(): MiddlewareHandler {
    return ({ request }, next) => {
      console.log(`[${this.source}] request body:`, request.body);
    };
  }
}
```

### Middleware levels

Middlewares can be used at 3 different levels:

- Endpoint level
- EndpointGroup level
- App level

Using a middleware at the **Endpoint level**:

```ts
@endpoint()
@middleware(LoggerMiddleware) // Your middleware here
class MyEndpoint implements Endpoint {
  handle(context: HttpContext) {
    // ...
  }
}
```

Using a middleware at the **EndpointGroup level**:

```ts
app.useEndpointGroup((eg) =>
  eg
    .useMiddleware(LoggerMiddleware) // Your middleware here
    .useEndpoint(Endpoint1)
    .useEndpoint(Endpoint2)
    .useEndpoint(Endpoint3)
);
```

Using a middleware at the **app level**:

```ts
app.useMiddleware(LoggerMiddleware); // Your middleware here
```

## Guards

A Guard is a special type of Middleware that determines if the incoming request has access to the resource.

Guards can have 3 different results:

- **boolean**: If true, the request can continue, otherwise, an UnauthorizedResponse is responded.
- **UnauthorizedResponse**: The server responds with a 401 status code.
- **ForbiddenResponse**: The server responds with a 403 status code.

> Know that any exception thrown in a Guard will be intercepted by the registered ErrorHandler, which is discussed in another section.

Now let's look at some examples.

For the following examples we will create a guard that expects the request to have the headers "clientId" and "clientSecret".

### GuardFunction

```ts
const apiClientGuard: GuardFunction = ({ request }: GuardContext) => {
  const { clientId, clientSecret } = request.headers;

  if (!clientId || !clientSecret) {
    return false; // Reject access to resource
  }

  return true; // Allow access to resource
};
```

### Guard interface

```ts
@guard()
class ApiClientGuard implements Guard {
  isAllowed({ request }: GuardContext): GuardResult {
    const { clientId, clientSecret } = request.headers;

    if (!clientId || !clientSecret) {
      return false; // Reject access to resource
    }

    return true; // Allow access to resource
  }
}
```

### GuardFactory

```ts
class ApiClientGuardFactory implements GuardFactory {
  constructor(
    private readonly clientIdHeader: string,
    private readonly clientSecretHeader: string
  ) {}

  create(): GuardFunction {
    return ({ request }: GuardContext) => {
      const clientId = request.headers[this.clientIdHeader];
      const clientSecret = request.headers[this.clientSecretHeader];

      if (!clientId || !clientSecret) {
        return false; // Reject access to resource
      }

      return true; // Allow access to resource
    };
  }
}
```

### Guard levels

Guards can be used at 3 different levels:

- Endpoint level
- EndpointGroup level
- App level

Using a guard at the **Endpoint level**:

```ts
@endpoint()
@useGuard(ApiClientGuard) // Your guard here
class MyEndpoint implements Endpoint {
  handle(context: HttpContext) {
    // ...
  }
}
```

Using a guard at the **EndpointGroup level**:

```ts
app.useEndpointGroup((eg) =>
  eg
    .useGuard(ApiClientGuard) // Your guard here
    .useEndpoint(Endpoint1)
    .useEndpoint(Endpoint2)
    .useEndpoint(Endpoint3)
);
```

Using a guard at the **app level**:

```ts
app.useGuard(ApiClientGuard); // Your guard here
```

## Pipes

To understand pipes, we first have to know about `Transforms`.

### Transforms

Transforms are simple, they take an input, process it, and return an output. You could think of it as an array map function, where you would apply an operation of some sort to an item and convert it into something else.

Let's look at an example that takes an array of strings, capitalizes each item, and converts it into a comma separated string.

#### TransformFunction

```ts
const readableArray: TransformFunction<string[], string> = (input) => {
  return input.map((str) => str.charAt(0).toUpperCase() + str.slice(1)).join(",");
};
```

#### Transform interface

```ts
class ReadableArray implements Transform<string[], string> {
  transform(input: string[]): string {
    return input.map((str) => str.charAt(0).toUpperCase() + str.slice(1)).join(",");
  }
}
```

#### TransformFactory

```ts
class ReadableArrayFactory implements TransformFactory<string[], string> {
  constructor(private readonly delimiter: string) {}

  create(): TransformFunction<string[], string> {
    return (input) => {
      return input.map((str) => str.charAt(0).toUpperCase() + str.slice(1)).join(this.delimiter);
    };
  }
}
```

Now that we know about transforms, lets look at pipes.

### What are pipes?

A pipe is a method decorator that can be applied to an endpoint class. They are useful because they can parse an incoming value from the HttpContext and transform it into something more useful.

To understand why pipes are necessary, take a look at the [HttpContext Typing](#httpcontext-typing) section

Let's see pipes in action.

Consider the example mentioned in the [HttpContext Typing](#httpcontext-typing) section

```ts
handle({ request }: HttpContext) {
  const pageSize: number = request.query.pageSize; // Careful here!
}
```

This code will show an error, because any incoming value in the query object will be a string.

With pipes, you can do the following:

```ts
@queryPipe("pageSize", NumberTransform) // transform the pageSize string into a number
handle({ request }: HttpContext) {
  const pageSize: number = request.query.pageSize as any; // pageSize should now be a number
}
```

Let's break down the pipe used here:

```ts
@queryPipe("pageSize", NumberTransform)
```

- `@queryPipe` is the actual pipe. It's a method decorator and can only be applied to the `handle` method of an endpoint class. TomasJS comes with more built-in decorators, as seen further below.
- `"pageSize"` is the first argument of the pipe. In this case it means we want to apply the transformation to the query parameter "pageSize".
- `NumberTransform` is the second argument of the pipe. It's a built-in transform that converts a string into a number. In this case it means to want to apply this transformation to the query parameter "pageSize".

Currently, TomasJS has the following built-in pipes:

### `@bodyPipe`

```ts
@bodyPipe(new InstanceTransform(User)) // Transform the body into an instance of the User class
handle(context: HttpContext) {
  const user: User = context.request.body;
  const isUserInstance = user instanceof User; // This will be true
}
```

### `@paramPipe`

```ts
@paramPipe("id", NumberTransform) // Transform the id path param into a number
handle({ request }: HttpContext) {
  const id: number = request.params.id as any; // This will be a number
}
```

### `@queryPipe`

```ts
@queryPipe("pageSize", NumberTransform) // Transform the pageSize query param into a number
handle({ request }: HttpContext) {
  const pageSize: number = request.query.pageSize as any; // This will be a number
}
```

## Error Handling

### TomasErrorHandler: The default error handler

TomasJS comes with a built-in error handler that is active by default: the `TomasErrorHandler` class.

Any unhandled error that occurs during the lifecycle of the HTTP pipeline will be intercepted by this error handler and correctly responded to the client.

Let's consider the following endpoint:

```ts
@endpoint()
class MyEndpoint implements Endpoint {
  handle(context: HttpContext) {
    throw new Error("Method not implemented.");
  }
}
```

If we try to `GET http://localhost:3000/`, the server will respond a 500 with following json:

```json
{ "status": 500, "message": "Method not implemented." }
```

> To enable the error handlers correctly, you must import the `express-async-errors` package in your `main.ts`.

### Custom error handlers

If you don't want to use the built-in error handler, you can always create your own.

#### ErrorHandlerFunction

```ts
const myErrorHandler: ErrorHandlerFunction = (error, context, next) => {
  // Handle the error
  next(error); // Fallback to express's error handler
};
```

#### ErrorHandler interface

```ts
class MyErrorHandler implements ErrorHandler {
  catch(error: any, context: HttpContext, next: NextFunction): void | Promise<void> {
    // Handle the error
    next(error); // Fallback to express's error handler
  }
}
```

Register your error handler like this:

```ts
app.useErrorHandler(MyErrorHandler);
```

# Dependency Injection

## Quick Guide

TomasJS has built-in support for Dependency Injection using [InversifyJS](https://inversify.io/) under the hood.

> Always initialize your DI container before your HTTP pipeline so your components can correctly use your services.

Let's look at an example that creates a GreeterService, adds it to the DI container and injects it into an Endpoint class.

Create a service using the `@injectable` decorator:

```ts
@injectable() // Mark your class as a service
class GreeterService {
  greet(name: string): string {
    return `Hello ${name}!`;
  }
}
```

Inject your service inside an endpoint class using the `@inject` decorator:

```ts
@endpoint("post")
@path("greet")
class GreetEndpoint implements Endpoint {
  constructor(
    @inject(GreeterService) private greeter: GreeterService // Inject your service
  ) {}

  handle({ request }: HttpContext) {
    const { name } = request.body;
    return this.greeter.greet(name); // Use your service
  }
}
```

Finally, initialize the DI container and add your service:

```ts
await new ContainerBuilder()
  .setup((services) => {
    services.addClass(GreeterService); // Add your service to the container
  })
  .buildAsync(); // Remember to call the buildAsync method!
```

## ContainerBuilder

The ContainerBuilder class is what you'll be using to initialize the DI container.

To create a ContainerBuilder simply instantiate the class:

```ts
const container = new ContainerBuilder();
```

To add services to the container use the `setup` method:

```ts
container.setup((services) => {
  // Add your services here
});
```

The `setup` method exposes an `IContainer` through the `services` argument. This object lets you register services with 2 methods: `addClass` and `addInstance`. Let's take a look at each one.

### `addClass`

The addClass method lets you register a class into the DI container.

The first argument is the constructor of the class you want to register:

```ts
services.addClass(MyService);
```

By default, the service is registered with the `transient` scope. If you want to specify another scope, you can pass an options argument as the second parameter.

For now TomasJS only supports the scopes `"transient"`, `"singleton"` and `"request"`. More information about these scopes can be found at [InversifyJS scopes](https://github.com/inversify/InversifyJS/blob/master/wiki/scope.md).

```ts
services.addClass(MyService, { scope: "transient" });
```

When adding a service to the DI container, each service must be identified by a unique token. When using the addClass method, the service gets registered with the class's constructor name.

In our example, since the constructor name is `MyService`, the service is registered with the `"MyService"` token, so when we want to inject our service, we would do it in the following way:

```ts
constructor(@inject(MyService) service: MyService) {}
```

Notice how we are using the `@inject` decorator and passing the MyService constructor as an argument. This is telling TomasJS to inject the service after the `"MyService"` token.

Sometimes we want to use a different token to register our service, to do this we can pass a `token` property into the options argument:

```ts
services.addClass(MyService, { token: "MyCustomToken" });
```

So when we inject our service, it would look like this:

```ts
constructor(@inject("MyCustomToken") service: MyService) {}
```

### `addInstance`

The addInstance method lets you register a constant value into the DI container.

Suppose we have the following class:

```ts
class Prefixer {
  constructor(private readonly prefix: string) {}

  prefixWord(word: string) {
    return `${this.prefix}${word}`;
  }
}
```

And we create multiple instances of that class:

```ts
const fooPrefixer = new Prefixer("foo");
const barPrefixer = new Prefixer("bar");
```

We can use the addInstance method to register each of those instances:

```ts
services.addInstance(fooPrefixer, "FooPrefixer");
services.addInstance(barPrefixer, "BarPrefixer");
```

Now we can inject those instances in the following way:

```ts
constructor(
  @inject("FooPrefixer") fooPrefixer: Prefixer,
  @inject("BarPrefixer") barPrefixer: Prefixer,
) {}
```

## ContainerSetupFactory

Managing your DI container can get messy quick, fortunately, TomasJS has the `ContainerSetupFactory` class.

You can use the ContainerSetupFactory class to split your service registrations. Let's look at an example that registers services used by a `/products` endpoint and services used by a `/orders` endpoint.

Suppose we have the following services:

```ts
@injectable()
class ProductRepository {
  // ...
}

@injectable()
class ProductService {
  constructor(@inject(ProductRepository) private repository: ProductRepository) {}
  // ...
}

@injectable()
class OrderRepository {
  // ...
}

@injectable()
class OrderService {
  constructor(@inject(OrderRepository) private repository: OrderRepository) {}
  // ...
}
```

We can create 2 setup classes for these services:

```ts
class ProductSetup extends ContainerSetupFactory {
  create(): ContainerSetup {
    return (services) => {
      services.addClass(ProductRepository);
      services.addClass(ProductService);
    };
  }
}

class OrderSetup extends ContainerSetupFactory {
  create(): ContainerSetup {
    return (services) => {
      services.addClass(OrderRepository);
      services.addClass(OrderService);
    };
  }
}
```

And now we only have to pass these setup classes to our container builder:

```ts
await new ContainerBuilder()
  .setup(new ProductSetup()) // Register services for /products
  .setup(new OrderSetup()) // Register services for /orders
  .buildAsync();
```
