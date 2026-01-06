# Dependency Injection

TomasJS implements it's own services container and builds the entire framework upon it.

Let's see how it works.

## Container

### Overview

The most fundamental piece of TomasJS's dependency injection is the container.

A container is the place where all of your services are registered. Each service is registered with an identifier called a "token". This token can then be used to query the container and get an instance of the associated service.

You can create an empty container like this:

```ts
import { Container } from "@tomasjs/core/dependency-injection";

const container = new Container();
```

To add a service to the container use the `add` method:

```ts
const myServiceId = "myService";
const myService = { foo: "bar" };
container.add("singleton", myServiceId, myService);
```

Then, we can build the container and get access to the registered services:

```ts
const services = container.build();
const myResolvedService = services.getOrThrow<typeof myService>(myServiceId);
console.log(myResolvedService.foo);
```

This of course is pretty verbose. We can do better. Instead, register your service with a class:

```ts
class MyService {
  foo = "bar";
}

container.add("singleton", MyService);

const services = container.build();
const myService = services.getOrThrow(MyService);
console.log(myService.foo);
```

## Scope

## ContainerBuilder

## ContainerSetup

## @inject
