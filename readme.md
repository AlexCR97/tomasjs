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
  - Guards
    - GuardResult
    - GuardFunction
    - Guard interface
    - GuardFactory
  - Pipes
    - PipeTransformParam
      - TransformFunction
      - Transform interface
      - TransformFactory
    - @bodyPipe
    - @paramPipe
    - @queryPipe
- Dependency Injection
  - @injectable
  - @inject
  - @singleton
  - ContainerBuilder
  - ContainerSetupFactory
  - ContainerTeardownFactory
- Authentication/Authorization
  - JwtGuard
  - RequiredClaimGuard
- API Validations
  - fluentvalidation
- Error Handling
  - Built-in errors
  - TomasErrorHandler: The default error handler
  - Custom error handlers
    - ErrorHandlerFunction
    - ErrorHandler interface
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
@middleware(LoggerMiddleware)
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
    .useMiddleware(LoggerMiddleware)
    .useEndpoint(Endpoint1)
    .useEndpoint(Endpoint2)
    .useEndpoint(Endpoint3)
);
```

Using a middleware at the **app level**:

```ts
app.useMiddleware(LoggerMiddleware);
```

## Guards
