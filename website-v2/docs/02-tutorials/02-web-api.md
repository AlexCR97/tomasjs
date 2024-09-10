# Web API

In this tutorial you'll create a web api to manage a todo list.

## Creating the project

In your preferred directory run the following command:

```bash
tomasjs init
```

> Choose the "Web API (beta)" template and name your project whatever your like. A directory with the specified project name will be created.

The following files will be created:

```txt
/your-project-name
    /node_modules
    /src
        app.ts
    .gitignore
    appconfig.json
    jest.config.ts
    package.json
    pnpm-lock.yaml
    tomasjs.json
    tsconfig.build.json
    tsconfig.json
```

We'll start with the following template in the `src/app.ts` file:

```ts
import "reflect-metadata";
import { RequestProfiler, WebAppBuilder } from "@tomasjs/web/app";

new WebAppBuilder()
  .setupContainer((container) => {
    // Register services
  })
  .setupHttpPipeline((pipeline) => {
    pipeline.use(RequestProfiler);
  })
  .build()
  .then((app) => app.start());
```

## The todo item

First let's create a class that will represent an item in our todo list.

Create a new file `src/todo.ts` and add the following import:

```ts
import { randomUUID, UUID } from "node:crypto";
```

We will use a UUID to uniquely identify our todo items.

Now add the following definitions:

```ts
export class Todo {
  constructor(public readonly id: UUID, public description: string, public done: boolean) {}

  static create(dto: CreateTodoDto): Todo {
    return new Todo(randomUUID(), dto.description, false);
  }

  update(dto: UpdateTodoDto): void {
    this.description = dto.description;
    this.done = dto.done;
  }
}

export type CreateTodoDto = {
  description: string;
};

export type UpdateTodoDto = {
  description: string;
  done: boolean;
};
```

Our todo class has 3 properties:

- A unique id
- A description
- A flag indicating wether's it's been done or not.

And 2 methods:

- A static method: `create`, which is a factory method to create instances of the class.
- An instance method: `update`, which we'll use to update an existing todo item.

## The todo service

Now that we can represent a todo item, we need a service to manage the CRUD (Create Read Update Delete) operations.

In the `src/todo.ts` file add the following class:

```ts
export class TodoService {
  private readonly todos: Todo[] = [];

  create(dto: CreateTodoDto): UUID {
    const todo = Todo.create(dto);
    this.todos.push(todo);
    return todo.id;
  }
}
```

The `todos` array will act as an in-memory database where we can store our todo items.

We've also added a `create` method which will create and add new todo items to the array.

Now lets register this service in our DI container in the `src/app.ts` file:

```ts
  .setupContainer((container) => {
    container.add("singleton", TodoService);
  })
```

> Notice how we registered the `TodoService` with a `singleton` scope. This is important because we want the `todos` array to be persistent during the entire lifetime of our application.

## Creating a todo

Add a POST endpoint to the http pipeline:

```ts
pipeline.post("/todo", ({ body, services }) => {
  // resolve the TodoService
  const todoService = services.getOrThrow(TodoService);

  // read JSON from the request body
  const createTodoDto = body.readJson<CreateTodoDto>();

  // use the TodoService to create a new todo item and get the id
  const createdId = todoService.create(createTodoDto);

  // respond with 201 and a JSON containing the id
  return new ServerResponse({
    status: HTTP_STATUS_CODES.created,
    content: JsonContent.from({ id: createdId }),
  });
});
```

At this point you should be able to create todo items.

To test it, run the application:

```bash
tomasjs dev
```

The application should output something similar to this:

```txt
00:45:20.935 INF Starting application...
00:45:20.937 INF Application listening at http://localhost:3000
```

Now you can try sending the following request:

```http
POST http://localhost:3000/todo
content-type: application/json

{
  "description": "Pet my cat"
}
```

And you'll receive a response similar to this:

```http
HTTP/1.1 201 Created
content-type: application/json

{
  "id": "da3b0487-a10f-41c1-9433-ee278a77cbb3"
}
```

Also, the application should output something similar to this:

```txt
00:47:03.892 INF HTTP POST /todo executing...
00:47:03.894 INF HTTP POST /todo responded 201 in 1ms
```

Hooray! We are now able to create todo items! But we can't really see them just yet. Let's take care of that.

## Getting the todos list

Add a `findAll` method to the `TodoService`:

```ts
findAll(): Todo[] {
  return this.todos;
}
```

Add a GET endpoint to the http pipeline:

```ts
pipeline.get("/todo", ({ services }) => {
  const todoService = services.getOrThrow(TodoService);
  return todoService.findAll();
});
```

When sending the request:

```http
GET http://localhost:3000/todo
```

You'll receive a response similar to this:

```http
HTTP/1.1 200 OK
content-type: application/json

[
  {
    "id": "da3b0487-a10f-41c1-9433-ee278a77cbb3",
    "description": "Pet my cat",
    "done": false
  }
]
```

## Getting a todo by ID

Add a `findOne` method to the `TodoService`:

```ts
findOne(id: string): Todo | undefined {
  return this.todos.find((x) => x.id === id);
}
```

Add another GET endpoint to the http pipeline, but now accepting a route parameter:

```ts
pipeline.get("/todo/:id", ({ params, services }) => {
  const todoService = services.getOrThrow(TodoService);

  // extract the "id" parameter from the request path
  const id = params.getOrThrow("id");

  // use the TodoService to find a todo by id
  const todo = todoService.findOne(id);

  // return the todo if it was found, otherwise, respond with 404
  return todo ?? HTTP_STATUS_CODES.notFound;
});
```

When sending the request:

```http
GET http://localhost:3000/todo/da3b0487-a10f-41c1-9433-ee278a77cbb3
```

You'll receive a response similar to this:

```http
HTTP/1.1 200 OK
content-type: application/json

{
  "id": "da3b0487-a10f-41c1-9433-ee278a77cbb3",
  "description": "Pet my cat",
  "done": false
}
```

## Updating a todo

Add an `update` method to the `TodoService`:

```ts
update(id: string, updateTodoDto: UpdateTodoDto): boolean {
  const match = this.findOne(id);

  if (!match) {
    return false;
  }

  match.update(updateTodoDto);
  return true;
}
```

Add a PUT endpoint to the http pipeline:

```ts
pipeline.put("/todo/:id", ({ body, params, services }) => {
  const todoService = services.getOrThrow(TodoService);
  const id = params.getOrThrow("id");
  const updateTodoDto = body.readJson<UpdateTodoDto>();

  // respond with 204 if the todo was found and updated
  // otherwise respond with 404
  return todoService.update(id, updateTodoDto)
    ? HTTP_STATUS_CODES.noContent
    : HTTP_STATUS_CODES.notFound;
});
```

When sending the request:

```http
PUT http://localhost:3000/todo/da3b0487-a10f-41c1-9433-ee278a77cbb3
content-type: application/json

{
  "description": "Pet my cat",
  "done": true
}
```

You'll receive a response similar to this:

```http
HTTP/1.1 204 No Content
```

## Deleting a todo

Add a `delete` method to the `TodoService`:

```ts
delete(id: string): boolean {
  const match = this.findOne(id);

  if (!match) {
    return false;
  }

  const index = this.todos.indexOf(match);
  this.todos.splice(index, 1);
  return true;
}
```

Add a DELETE endpoint to the http pipeline:

```ts
pipeline.delete("/todo/:id", ({ params, services }) => {
  const todoService = services.getOrThrow(TodoService);
  const id = params.getOrThrow("id");

  // respond with 204 if the todo was found and deleted
  // otherwise respond with 404
  return todoService.delete(id) ? HTTP_STATUS_CODES.noContent : HTTP_STATUS_CODES.notFound;
});
```

When sending the request:

```http
DELETE http://localhost:3000/todo/da3b0487-a10f-41c1-9433-ee278a77cbb3
```

You'll receive a response similar to this:

```http
HTTP/1.1 204 No Content
```

And if you send the request again after having deleted the todo, you should receive a 404 response:

```http
HTTP/1.1 404 Not Found
```

## The complete program

```ts
// src/todo.ts

import { randomUUID, UUID } from "node:crypto";

export class Todo {
  constructor(public readonly id: UUID, public description: string, public done: boolean) {}

  static create(dto: CreateTodoDto): Todo {
    return new Todo(randomUUID(), dto.description, false);
  }

  update(dto: UpdateTodoDto): void {
    this.description = dto.description;
    this.done = dto.done;
  }
}

export type CreateTodoDto = {
  description: string;
};

export type UpdateTodoDto = {
  description: string;
  done: boolean;
};

export class TodoService {
  private readonly todos: Todo[] = [];

  create(dto: CreateTodoDto): UUID {
    const todo = Todo.create(dto);
    this.todos.push(todo);
    return todo.id;
  }

  findAll(): Todo[] {
    return this.todos;
  }

  findOne(id: string): Todo | undefined {
    return this.todos.find((x) => x.id === id);
  }

  update(id: string, updateTodoDto: UpdateTodoDto): boolean {
    const match = this.findOne(id);

    if (!match) {
      return false;
    }

    match.update(updateTodoDto);
    return true;
  }

  delete(id: string): boolean {
    const match = this.findOne(id);

    if (!match) {
      return false;
    }

    const index = this.todos.indexOf(match);
    this.todos.splice(index, 1);
    return true;
  }
}
```

```ts
// src/app.ts

import "reflect-metadata";
import { HTTP_STATUS_CODES, JsonContent } from "@tomasjs/core/http";
import { RequestProfiler, WebAppBuilder } from "@tomasjs/web/app";
import { ServerResponse } from "@tomasjs/web/server";
import { CreateTodoDto, TodoService, UpdateTodoDto } from "./todo";

new WebAppBuilder()
  .setupContainer((container) => {
    container.add("singleton", TodoService);
  })
  .setupHttpPipeline((pipeline) => {
    pipeline.use(RequestProfiler);

    pipeline.post("/todo", ({ body, services }) => {
      const todoService = services.getOrThrow(TodoService);
      const createTodoDto = body.readJson<CreateTodoDto>();
      const createdId = todoService.create(createTodoDto);
      return new ServerResponse({
        status: HTTP_STATUS_CODES.created,
        content: JsonContent.from({ id: createdId }),
      });
    });

    pipeline.get("/todo", ({ services }) => {
      const todoService = services.getOrThrow(TodoService);
      return todoService.findAll();
    });

    pipeline.get("/todo/:id", ({ params, services }) => {
      const todoService = services.getOrThrow(TodoService);
      const id = params.getOrThrow("id");
      const todo = todoService.findOne(id);
      return todo ?? HTTP_STATUS_CODES.notFound;
    });

    pipeline.put("/todo/:id", ({ body, params, services }) => {
      const todoService = services.getOrThrow(TodoService);
      const id = params.getOrThrow("id");
      const updateTodoDto = body.readJson<UpdateTodoDto>();
      return todoService.update(id, updateTodoDto)
        ? HTTP_STATUS_CODES.noContent
        : HTTP_STATUS_CODES.notFound;
    });

    pipeline.delete("/todo/:id", ({ params, services }) => {
      const todoService = services.getOrThrow(TodoService);
      const id = params.getOrThrow("id");
      return todoService.delete(id) ? HTTP_STATUS_CODES.noContent : HTTP_STATUS_CODES.notFound;
    });
  })
  .build()
  .then((app) => app.start());
```
