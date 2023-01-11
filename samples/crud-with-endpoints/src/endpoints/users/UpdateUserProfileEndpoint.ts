import { HttpContext } from "tomasjs/core";
import { endpoint, Endpoint, path } from "tomasjs/endpoints";
import { inRepository, Repository } from "tomasjs/mikro-orm/mongodb";
import {
  BadRequestResponse,
  NoContentResponse,
  NotFoundResponse,
} from "tomasjs/responses/status-codes";
import { User } from "@/entities/User";

interface PatchRequest {
  id: string;
  firstName?: string;
  lastName?: string;
}

@endpoint("patch")
@path(":id/profile")
export class UpdateUserProfileEndpoint implements Endpoint {
  constructor(@inRepository(User) private readonly usersRepository: Repository<User>) {}

  async handle(context: HttpContext) {
    const userId = context.request.params.id;
    const patchRequest: PatchRequest = context.request.body;

    if (userId !== patchRequest.id) {
      return new BadRequestResponse();
    }

    const existingUser = await this.usersRepository.findOne({ id: userId });

    if (existingUser === undefined || existingUser === null) {
      return new NotFoundResponse();
    }

    existingUser.firstName = patchRequest.firstName;
    existingUser.lastName = patchRequest.lastName;
    await this.usersRepository.nativeUpdate({ id: userId }, existingUser);
    return new NoContentResponse();
  }
}
