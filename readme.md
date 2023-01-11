# TomasJS

## What is TomasJS?

TomasJS is the modern lightweight express framework 🔥😎.

Rapidly build highly scalable server side applications using TomasJS's built-in:

- AppBuilder fluent api
- Dependency injection
- TypeScript-first support
- Object Oriented approach

## Guides

1. [Getting started](#1-getting-started)
   1. [Installation](#11-installation)
   2. [Your first TomasJS app](#12-your-first-tomasjs-app)
2. [Fundamentals](#2-fundamentals)
   1. [AppBuilder](#21-appbuilder)
   2. [Endpoints](#22-endpoints)
      1. Endpoint class
      2. AnonymousEndpoint class
   3. [EndpointGroups](#23-endpointgroups)
   4. [Middlewares](#24-middlewares)
      1. [Middleware class](#241-middleware-class)
      2. [ErrorMiddleware class](#242-errormiddleware-class)
      3. [Built-in Middlewares](#243-built-in-middlewares)
3. [Integration with 3rd party libraries](#3-integration-with-3rd-party-libraries)
   1. [Databases](#31-databases)
4. [Samples](#4-samples)

## 1. Getting started

### 1.1 Installation

Create a node.js express project and run the following command:

```
npm install tomasjs
```

### 1.2 Your first TomasJS app

Create the following file:

```typescript
import "reflect-metadata";
import { AppBuilder } from "tomasjs/builder";
import { AnonymousEndpoint } from "tomasjs/endpoints";

const PORT = 3000;

async function main() {
  console.log("Creating a TomasJS app...");

  const app = new AppBuilder().useEndpoint(
    new AnonymousEndpoint("get", "/", () => {
      return "Hello, TomasJS!";
    })
  );

  await app.buildAsync(PORT);

  console.log("TomasJS app is running!");
}

main();
```

Now run the file.

You should be able to reach your app at http://localhost:3000. The following content should be displayed in your browser

```
Hello, TomasJS!
```

Congratulations! You just created for first TomasJS app!

## 2. Fundamentals

### 2.1 AppBuilder

Coming soon

### 2.2 Endpoints

Coming soon

### 2.3 EndpointGroups

Coming soon

### 2.4 Middlewares

#### 2.4.1 Middleware class

#### 2.4.2 ErrorMiddleware class

#### 2.4.3 Built-in Middlewares

TomasJS has several built-in middleware for typical use cases:

- JwtMiddleware
- RequiredClaimMiddleware

###

Coming soon

## 3. Integration with 3rd party libraries

### 3.1 Databases

- MikroORM

## 4. Samples

You can find sample in this same repository under the /samples directory.

Direct links are provided below.

- CRUD with Endpoints: https://github.com/AlexCR97/tomasjs/tree/main/samples/crud-with-endpoints
- CRUD with Controllers: https://github.com/AlexCR97/tomasjs/tree/main/samples/crud-with-controllers
- JWT Authentication: https://github.com/AlexCR97/tomasjs/tree/main/samples/jwt-authentication
