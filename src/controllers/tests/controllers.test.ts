import { body } from "../@body";
import { controller } from "../@controller";
import { get, http, patch, post, put } from "../@http";
import { param } from "../@param";
import { query } from "../@query";
import { useGuard } from "../@useGuard";
import { useInterceptor } from "../@useInterceptor";
import { useMiddleware } from "../@useMiddleware";

class CreateUserRequest {}

class FindRequest {}

class UpdateUserRequest {}

class UpdateUserProfileRequest {}

@controller("users")
@useMiddleware(undefined as any)
@useGuard(undefined as any)
@useInterceptor(undefined as any)
export class UsersController {
  @post()
  create(@body() body: CreateUserRequest) {}

  @get()
  find(@query() query: FindRequest) {}

  @get(":id")
  get(@param("id") id: string) {}

  @get(":id/profile")
  getProfile(@param("id") id: string) {}

  @put(":id")
  update(@param("id") id: string, @body() body: UpdateUserRequest) {}

  @patch(":id/profile")
  updateProfile(@param("id") id: string, @body() body: UpdateUserProfileRequest) {}

  @http("delete", ":id")
  delete(@param("id") id: string) {}
}
