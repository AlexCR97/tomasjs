import { HttpContext, StatusCodes } from "tomasjs/core";
import { endpoint, Endpoint } from "tomasjs/endpoints";
import { inRepository, Repository } from "tomasjs/mikro-orm/mongodb";
import { bodyPipe } from "tomasjs/pipes";
import { PlainTextResponse } from "tomasjs/responses";
import { BadRequestResponse } from "tomasjs/responses/status-codes";
import { InstanceTransform } from "tomasjs/transforms";
import { User } from "@/entities/User";

@endpoint("post")
export class CreateUserEndpoint implements Endpoint {
  constructor(@inRepository(User) private readonly usersRepository: Repository<User>) {}

  @bodyPipe(new InstanceTransform(User))
  async handle(context: HttpContext) {
    const user: User = context.request.body;

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
