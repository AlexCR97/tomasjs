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

interface PatchRequest {
  id: string;
  firstName?: string;
  lastName?: string;
}

@injectable()
export class UpdateUserProfileEndpoint extends Endpoint {
  constructor(@inRepository(User) private readonly usersRepository: Repository<User>) {
    super();
    this.method("patch").path("/:id/profile");
  }
  async handle(context: HttpContext) {
    const userId = context.request.params.id;
    const patchRequest = context.request.getBody<PatchRequest>();

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
