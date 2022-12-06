import { Controller } from "../../src/controllers";
import { HttpContext } from "../../src/core";
import {
  BadRequestResponse,
  CreatedResponse,
  NoContentResponse,
  NotFoundResponse,
} from "../../src/responses/status-codes";
import { User } from "./User";

let lastGeneratedId = 0;
const users: User[] = [];

export class UserController extends Controller {
  constructor() {
    super();

    this.route("users")
      // Get all users
      .get("/", (context: HttpContext) => {
        return users;
      })
      // Get user by id
      .get("/:id", (context: HttpContext) => {
        const userId = Number(context.request.params.id);
        const user = users.find((x) => x.id === userId);
        return user === undefined ? new NotFoundResponse() : user;
      })
      // Create a user
      .post("/", (context: HttpContext) => {
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
      })
      // Update a user entirely
      .put("/:id", (context: HttpContext) => {
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
      })
      // Update a user partially
      .patch("/:id/profile", (context: HttpContext) => {
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
      })
      // Delete a user
      .delete("/:id", (context: HttpContext) => {
        const userId = Number(context.request.params.id);
        const existingUser = users.find((x) => x.id === userId);

        if (existingUser === undefined) {
          return new NotFoundResponse();
        }

        const userIndex = users.indexOf(existingUser);
        users.splice(userIndex, 1);
        return new NoContentResponse();
      });
  }
}
