import { User } from "@/entities/User";
import { HttpContext } from "tomasjs/core";
import { Endpoint } from "tomasjs/endpoints";
import { inRepository, Repository } from "tomasjs/mikro-orm/mongodb";
import {
  BadRequestResponse,
  NoContentResponse,
  NotFoundResponse,
} from "tomasjs/responses/status-codes";
import { injectable } from "tsyringe";

@injectable()
export class UpdateUserEndpoint extends Endpoint {
  constructor(
    @inRepository(User) private readonly usersRepository: Repository<User>
  ) {
    super();
    this.method("put").path("/:id");
  }
  async handle(context: HttpContext) {
    const userId = context.request.params.id;
    const userFromBody = context.request.getBody<User>();

    if (userId !== userFromBody.id) {
      return new BadRequestResponse();
    }

    const existingUser = await this.usersRepository.findOne({ id: userId });

    if (existingUser === undefined || existingUser === null) {
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
    await this.usersRepository.nativeUpdate({ id: userId }, existingUser);
    return new NoContentResponse();
  }
}
