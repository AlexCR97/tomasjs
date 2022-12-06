import { HttpContext } from "../../src/core";
import { RequestHandler } from "../../src/requests";
import { BaseResponse, StatusCodeResponse } from "../../src/responses";
import {
  BadRequestResponse,
  CreatedResponse,
  NoContentResponse,
  NotFoundResponse,
} from "../../src/responses/status-codes";
import { User } from "./User";

let lastGeneratedId = 0;
const users: User[] = [];

export class GetAllUsersHandler extends RequestHandler<User[]> {
  constructor() {
    super();
    this.path("/users");
  }
  handle(context: HttpContext): User[] {
    return users;
  }
}

export class GetUserByIdHandler extends RequestHandler<User | StatusCodeResponse> {
  constructor() {
    super();
    this.path("/users/:id");
  }
  handle(context: HttpContext): User | StatusCodeResponse {
    const userId = Number(context.request.params.id);
    const user = users.find((x) => x.id === userId);
    return user === undefined ? new NotFoundResponse() : user;
  }
}

export class CreateUserHandler extends RequestHandler<BaseResponse> {
  constructor() {
    super();
    this.method("post").path("/users");
  }
  handle(context: HttpContext): BaseResponse {
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
    return new CreatedResponse();
  }
}

export class UpdateUserHandler extends RequestHandler<BaseResponse> {
  constructor() {
    super();
    this.method("put").path("/users/:id");
  }
  handle(context: HttpContext): BaseResponse {
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

export class UpdateUserProfileHandler extends RequestHandler<BaseResponse> {
  constructor() {
    super();
    this.method("patch").path("/users/:id/profile");
  }
  handle(context: HttpContext): BaseResponse | Promise<BaseResponse> {
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

export class DeleteUserHandler extends RequestHandler<BaseResponse> {
  constructor() {
    super();
    this.method("delete").path("/users/:id");
  }
  handle(context: HttpContext): BaseResponse | Promise<BaseResponse> {
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
