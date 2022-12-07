import { HttpContext, StatusCodes } from "../../src/core";
import { Endpoint } from "../../src/endpoints";
import { PlainTextResponse } from "../../src/responses";
import {
  BadRequestResponse,
  NoContentResponse,
  NotFoundResponse,
  OkResponse,
} from "../../src/responses/status-codes";
import { User } from "./User";

export const seedUsersCount = 3; // Used by tests
let lastGeneratedId = 1;
let users: User[] = [];

export class SeedUsersEndpoint extends Endpoint {
  constructor() {
    super();
    this.method("post").path("/users/seed");
  }
  handle(context: HttpContext) {
    lastGeneratedId = 1;
    users = [];

    Array.from(Array(seedUsersCount).keys()).forEach(() => {
      users.push({
        id: lastGeneratedId,
        email: `user${lastGeneratedId}@domain.com`,
        password: `user${lastGeneratedId}@123456`,
      });
      lastGeneratedId += 1;
    });

    return new OkResponse();
  }
}

export class ClearUsersEndpoint extends Endpoint {
  constructor() {
    super();
    this.method("delete").path("/users/clear");
  }
  handle(context: HttpContext) {
    lastGeneratedId = 1;
    users = [];
    return new OkResponse();
  }
}

export class GetAllUsersEndpoint extends Endpoint {
  constructor() {
    super();
    this.path("/users");
  }
  handle(context: HttpContext) {
    return users;
  }
}

export class GetUserByIdEndpoint extends Endpoint {
  constructor() {
    super();
    this.path("/users/:id");
  }
  handle(context: HttpContext) {
    const userId = Number(context.request.params.id);
    const user = users.find((x) => x.id === userId);
    return user === undefined ? new NotFoundResponse() : user;
  }
}

export class CreateUserEndpoint extends Endpoint {
  constructor() {
    super();
    this.method("post").path("/users");
  }
  handle(context: HttpContext) {
    const user = context.request.getBody<User>();

    if (user.email === undefined || user.email.trim().length === 0) {
      return new BadRequestResponse();
    }

    if (user.password === undefined || user.password.trim().length === 0) {
      return new BadRequestResponse();
    }

    lastGeneratedId += 1;
    user.id = lastGeneratedId;
    users.push(user);
    return new PlainTextResponse(user.id.toString(), { status: StatusCodes.created });
  }
}

export class UpdateUserEndpoint extends Endpoint {
  constructor() {
    super();
    this.method("put").path("/users/:id");
  }
  handle(context: HttpContext) {
    const userId = Number(context.request.params.id);
    const userFromBody = context.request.getBody<User>();

    if (userId !== userFromBody.id) {
      return new BadRequestResponse();
    }

    const existingUser = users.find((x) => x.id === userId);

    if (existingUser === undefined) {
      return new NotFoundResponse();
    }

    if (userFromBody.email === undefined || userFromBody.email.trim().length === 0) {
      return new BadRequestResponse();
    }

    if (userFromBody.password === undefined || userFromBody.password.trim().length === 0) {
      return new BadRequestResponse();
    }

    existingUser.email = userFromBody.email;
    existingUser.password = userFromBody.password;
    existingUser.firstName = userFromBody.firstName;
    existingUser.lastName = userFromBody.lastName;
    return new NoContentResponse();
  }
}

export class UpdateUserProfileEndpoint extends Endpoint {
  constructor() {
    super();
    this.method("patch").path("/users/:id/profile");
  }
  handle(context: HttpContext) {
    interface PatchRequest {
      id: number;
      firstName?: string;
      lastName?: string;
    }

    const userId = Number(context.request.params.id);
    const patchRequest = context.request.getBody<PatchRequest>();

    if (userId !== patchRequest.id) {
      return new BadRequestResponse();
    }

    const existingUser = users.find((x) => x.id === userId);

    if (existingUser === undefined) {
      return new NotFoundResponse();
    }

    existingUser.firstName = patchRequest.firstName;
    existingUser.lastName = patchRequest.lastName;
    return new NoContentResponse();
  }
}

export class DeleteUserEndpoint extends Endpoint {
  constructor() {
    super();
    this.method("delete").path("/users/:id");
  }
  handle(context: HttpContext) {
    const userId = Number(context.request.params.id);
    const existingUser = users.find((x) => x.id === userId);

    if (existingUser === undefined) {
      return new NotFoundResponse();
    }

    const userIndex = users.indexOf(existingUser);
    users.splice(userIndex, 1);
    return new NoContentResponse();
  }
}
