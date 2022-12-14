import { User } from "@/entities/User";
import { HttpContext, StatusCodes } from "tomasjs/core";
import { Endpoint } from "tomasjs/endpoints";
import { inRepository, Repository } from "tomasjs/mikro-orm/mongodb";
import { PlainTextResponse } from "tomasjs/responses";
import { BadRequestResponse } from "tomasjs/responses/status-codes";
import { injectable } from "tsyringe";

@injectable()
export class CreateUserEndpoint extends Endpoint {
  constructor(
    @inRepository(User) private readonly usersRepository: Repository<User>
  ) {
    super();
    this.method("post");
  }
  async handle(context: HttpContext) {
    const user = context.request.getBody<User>();

    if (user.email === undefined || user.email.trim().length === 0) {
      return new BadRequestResponse();
    }

    if (user.password === undefined || user.password.trim().length === 0) {
      return new BadRequestResponse();
    }

    const createdUserId = await this.usersRepository.nativeInsert(user);
    return new PlainTextResponse(createdUserId.toString(), { status: StatusCodes.created });
  }
}
