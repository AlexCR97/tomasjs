import { HttpContext } from "tomasjs/core";
import { endpoint, Endpoint, path } from "tomasjs/endpoints";
import { inRepository, Repository } from "tomasjs/mikro-orm/mongodb";
// import { bodyPipe } from "tomasjs/pipes";
import {
  BadRequestResponse,
  NoContentResponse,
  NotFoundResponse,
} from "tomasjs/responses/status-codes";
import { InstanceTransform } from "tomasjs/transforms";
import { User } from "@/entities/User";

@endpoint("put")
@path(":id")
export class UpdateUserEndpoint implements Endpoint {
  constructor(@inRepository(User) private readonly usersRepository: Repository<User>) {}

  // @bodyPipe(new InstanceTransform(User)) // TODO Uncomment this once bug with @bodyPipe has been fixed
  async handle(context: HttpContext) {
    const userId = context.request.params.id;

    const instanceTransform = new InstanceTransform(User);
    const userFromBody = await instanceTransform.transform(context.request.body);

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
