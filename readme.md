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
   2. [Your first tomasjs app](#12-your-first-tomasjs-app)
2. [Fundamentals](#2-fundamentals)
   1. [AppBuilder](#21-appbuilder)
   2. [Endpoints](#22-endpoints)
   3. [Middlewares](#23-middlewares)

## 1. Getting started

### 1.1 Installation

Create a node.js express project and run the following command:

```
npm install tomasjs
```

### 1.2 Your first tomasjs app

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

### 2.3 Middlewares

Coming soon
